import json
import math
import re
from typing import List, Dict, Any, Optional, Set
from sqlalchemy.orm import Session
from app.database.models import UserProfile, ChatMessage

# Simple pure-Python TF-IDF Vectorizer & Cosine Similarity for Zero-Dependency Vector Memory
class LocalVectorStore:
    def __init__(self):
        self.documents = []  # List of dicts: {"id": str, "text": str, "metadata": dict}
    
    def _tokenize(self, text: str) -> List[str]:
        # Lowercase and split on words
        return re.findall(r'\w+', text.lower())

    def _compute_tf(self, tokens: List[str]) -> Dict[str, float]:
        tf = {}
        for token in tokens:
            tf[token] = tf.get(token, 0) + 1
        length = len(tokens) or 1
        return {k: v / length for k, v in tf.items()}

    def _compute_idf(self, all_tokenized_docs: List[List[str]], vocabulary: Set) -> Dict[str, float]:
        N = len(all_tokenized_docs) or 1
        idf = {}
        for term in vocabulary:
            df = sum(1 for doc in all_tokenized_docs if term in doc)
            idf[term] = math.log((1 + N) / (1 + df)) + 1
        return idf

    def add_texts(self, texts: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        for text, meta, doc_id in zip(texts, metadatas, ids):
            # Check if exists, update or insert
            self.documents = [doc for doc in self.documents if doc["id"] != doc_id]
            self.documents.append({
                "id": doc_id,
                "text": text,
                "metadata": meta
            })

    def similarity_search(self, query: str, k: int = 3, metadata_filter: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        # Pre-filter documents by metadata if filter is provided
        docs = self.documents
        if metadata_filter:
            docs = []
            for doc in self.documents:
                meta = doc.get("metadata", {})
                match = True
                for fk, fv in metadata_filter.items():
                    if meta.get(fk) != fv:
                        match = False
                        break
                if match:
                    docs.append(doc)

        if not docs:
            return []
        
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return docs[:k]
            
        doc_tokens_list = [self._tokenize(doc["text"]) for doc in docs]
        vocabulary = set(query_tokens)
        for doc_tokens in doc_tokens_list:
            vocabulary.update(doc_tokens)
            
        idf = self._compute_idf(doc_tokens_list, vocabulary)
        
        # Calculate Query Vector
        query_tf = self._compute_tf(query_tokens)
        query_vector = {term: query_tf.get(term, 0.0) * idf[term] for term in vocabulary}
        query_norm = math.sqrt(sum(v * v for v in query_vector.values()))
        
        scores = []
        for idx, doc in enumerate(docs):
            doc_tf = self._compute_tf(doc_tokens_list[idx])
            doc_vector = {term: doc_tf.get(term, 0.0) * idf[term] for term in vocabulary}
            doc_norm = math.sqrt(sum(v * v for v in doc_vector.values()))
            
            # Cosine similarity
            dot_product = sum(query_vector[term] * doc_vector[term] for term in vocabulary)
            denominator = query_norm * doc_norm
            similarity = dot_product / denominator if denominator > 0 else 0.0
            
            scores.append((similarity, doc))
            
        # Sort by similarity score descending
        scores.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scores[:k]]

# Global instance of local vector database
vector_memory = LocalVectorStore()

from collections import Counter
from typing import Set

def get_or_create_profile(db: Session, user_id: int) -> UserProfile:
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        profile = UserProfile(
            user_id=user_id,
            branch="",
            cgpa=0.0,
            skills=[],
            interests=[],
            budget=0.0,
            preferred_companies=[],
            favorite_domains=[],
            health_goals={},
            shopping_preferences={},
            travel_preferences={},
            resume_text=""
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_user_memory_from_dict(db: Session, user_id: int, updates: Dict[str, Any]) -> UserProfile:
    """
    Updates specific fields of the user profile based on AI deductions.
    """
    profile = get_or_create_profile(db, user_id)
    
    for key, value in updates.items():
        if hasattr(profile, key) and value is not None:
            # For JSON arrays/dicts, merge or replace
            curr_val = getattr(profile, key)
            if isinstance(curr_val, list) and isinstance(value, list):
                # Unique merge
                new_list = list(set(curr_val + value))
                setattr(profile, key, new_list)
            elif isinstance(curr_val, dict) and isinstance(value, dict):
                # Update key-value dict
                curr_val.update(value)
                setattr(profile, key, curr_val)
            else:
                setattr(profile, key, value)
                
    db.commit()
    db.refresh(profile)
    return profile


def add_to_vector_memory(user_id: int, conversation_id: str, query: str, response: str):
    """
    Saves a conversation segment to the semantic memory.
    """
    doc_id = f"chat_{conversation_id}_{datetime.now().timestamp()}"
    text = f"User asked: {query}\nAI replied: {response}"
    vector_memory.add_texts(
        texts=[text],
        metadatas=[{"user_id": user_id, "conversation_id": conversation_id, "type": "chat_history"}],
        ids=[doc_id]
    )


def search_vector_memory(user_id: int, query: str, limit: int = 3, filename: Optional[str] = None) -> List[str]:
    """
    Searches semantic vector memory for relevant past discussions.
    If filename is provided, we restrict search to chunks of that document!
    """
    metadata_filter = {"user_id": user_id}
    if filename:
        metadata_filter["filename"] = filename
        
    results = vector_memory.similarity_search(query, k=limit, metadata_filter=metadata_filter)
    return [doc["text"] for doc in results]


# Inline datetime import for vector store timestamping
from datetime import datetime
