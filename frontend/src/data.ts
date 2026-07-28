export interface TimelineStage {
  stageName: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Not Yet';
  deadline?: string; // ISO Date or description
  daysLeft?: number;
  details?: string;
  fileNameRequired?: string;
  fileUploaded?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  host: string;
  platform: string; // "Unstop", "Devpost", "MLH", "Buddy4Study", "LeetCode", etc.
  description: string;
  fee: number; // 0 for Free, or amount in INR
  teamSize: string; // "Solo", "1 - 4 Members", "2 - 4 Members"
  postedDate?: string;
  registeredCount: number;
  locationText: string; // "Online", "On-site", "Hybrid" or specific cities
  aboutText: string;
  tracks?: string[];
  benefits?: string[];
  isApplied: boolean;
  timeline?: TimelineStage[];
  url?: string;
}

export interface Hackathon extends Opportunity {
  tags: ('AI' | 'Web Dev' | 'Cybersecurity' | 'Blockchain' | 'Open Innovation' | 'Healthcare' | 'Hardware' | 'IoT')[];
  mode: 'Online' | 'Offline';
  scale: 'College' | 'National' | 'International';
  registrationDeadline: string; // ISO date string
  date: string;
  url: string;
}

export interface Internship extends Opportunity {
  company: string;
  role: string;
  stipend: string;
  stipendValue: number; // numerical for filtering (>20k)
  location: 'Remote' | 'On-site' | 'Hybrid';
  field: 'Software' | 'AI' | 'Mechanical' | 'ECE' | 'Civil';
  deadline: string; // ISO date string
}

export interface Scholarship extends Opportunity {
  name: string;
  provider: string;
  amount: string;
  deadline: string; // ISO date string
  eligibility: {
    categories: ('General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Minority')[];
    incomeLimit: number; // Max annual income in INR
    states: string[]; // ["Karnataka", "Maharashtra", "All", etc.]
    genders: ('Male' | 'Female' | 'Other' | 'All')[];
    degrees: ('BTech' | 'MBA' | 'MCA' | 'Diploma' | 'All')[];
    years: ('1st' | '2nd' | '3rd' | '4th' | 'All')[];
  };
}

export interface CodingContest extends Opportunity {
  date: string;
  time: string;
  duration: string;
  contestPlatform: 'Codeforces' | 'LeetCode' | 'CodeChef' | 'HackerRank' | 'AtCoder';
}

export interface StudentProfile {
  name: string;
  email: string;
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Minority';
  annualIncome: number; // in INR
  state: string; // "Karnataka", "Maharashtra", "Tamil Nadu", etc.
  gender: 'Male' | 'Female' | 'Other';
  degree: 'BTech' | 'MBA' | 'MCA' | 'Diploma';
  year: '1st' | '2nd' | '3rd' | '4th';
  skills: string[];
}

export const initialProfile: StudentProfile = {
  name: "Arjun Sharma",
  email: "arjun.sharma.btech@gmail.com",
  category: "OBC",
  annualIncome: 200000,
  state: "Karnataka",
  gender: "Male",
  degree: "BTech",
  year: "3rd",
  skills: ["Python", "HTML", "React", "CSS"]
};

export const initialHackathons: Hackathon[] = [
  {
    id: "h1",
    title: "Port Mortem 2026 | Code Resurrection Hackathon",
    host: "Hackathon Raptors",
    platform: "Unstop",
    description: "A hybrid event designed to test code resurrection, refactoring, and AI-driven architecture modernization.",
    fee: 0,
    teamSize: "1 - 4 Members",
    postedDate: "Aug 25, 2026",
    registeredCount: 45,
    locationText: "Online",
    aboutText: "Port Mortem is a nationwide developers contest aiming to resurrect legacy projects using modern tech stacks. Teams will pick older repositories (pre-2020) and update them with containerization, TypeScript type safety, and AI assistance integrations.",
    tracks: [
      "Track 1: Legacy Code Modernization & Refactoring",
      "Track 2: Containerization & Cloud Native Deployments",
      "Track 3: AI Copilots & Developer Tools integration"
    ],
    benefits: [
      "Cash prizes up to ₹1.5 Lakhs",
      "Official certificate of participation",
      "Fast-track interview opportunities with sponsor startups"
    ],
    tags: ["Open Innovation", "Web Dev"],
    mode: "Online",
    scale: "National",
    registrationDeadline: "2026-09-25T23:59:59Z",
    date: "September 28-30, 2026",
    url: "https://unstop.com/search?q=Port%20Mortem",
    isApplied: false
  },
  {
    id: "h2",
    title: "InnoGenesis 2026 - National Level Hackathon",
    host: "DR RVR NRI Institute of Technology Deemed to Be University",
    platform: "Unstop",
    description: "Features 24 hours of non-stop innovation, bringing together talented students to build, innovate, and create impactful solutions.",
    fee: 500,
    teamSize: "2 - 4 Members",
    postedDate: "Aug 25, 2026",
    registeredCount: 29,
    locationText: "DR.RVR NRI INSTITUTE OF TECHNOLOGY, Vijayawada, Andhra Pradesh, India",
    aboutText: "InnoGenesis 2026 is a premium National Level Hackathon organized to test engineering problem solving. The event is scheduled to be held on 7-8 October 2026 and features 24 hours of non-stop innovation, bringing together students to solve hardware and software problems in smart systems.",
    tracks: [
      "Track 1: 24-Hour Hackathon (AI/ML, Agentic AI, IoT, Healthcare, Smart Energy)",
      "Track 2: Prototype Exhibition & Demo Sessions (Hardware Prototyping)"
    ],
    benefits: [
      "Cash prizes worth up to ₹5 Lakhs",
      "Certificates of Merit and Participation",
      "Mentorship & Networking with Industry Experts",
      "Accommodation, Food & Refreshments included",
      "Music sessions and fun games"
    ],
    tags: ["AI", "Hardware", "IoT"],
    mode: "Offline",
    scale: "National",
    registrationDeadline: "2026-09-23T23:59:59Z",
    date: "October 7-8, 2026",
    url: "https://unstop.com/search?q=InnoGenesis",
    isApplied: true,
    timeline: [
      { stageName: "Internal Evaluation", status: "Completed", details: "Cleared college-level round" },
      { stageName: "PPT Submission", status: "Pending", deadline: "2026-08-29T23:59:59Z", daysLeft: 2, details: "Upload solution PPT", fileNameRequired: "sih_solution_proposal.pdf", fileUploaded: false },
      { stageName: "Grand Finale Result", status: "Not Yet", details: "Announced post-finals" }
    ]
  },
  {
    id: "h3",
    title: "IKIGAI 2026",
    host: "Acropolis Institute of Technology and Research, Indore",
    platform: "Unstop",
    description: "A software and web application development sprint organized to discover regional developer talent.",
    fee: 500,
    teamSize: "2 - 4 Members",
    postedDate: "Aug 25, 2026",
    registeredCount: 18,
    locationText: "Acropolis Institute of Technology And Research, Indore, Madhya Pradesh, India",
    aboutText: "IKIGAI 2026 is a design and development marathon held at Acropolis campus in Indore. Focuses on building lightweight apps, progressive web applications, and utility plugins that solve immediate educational or micro-business needs.",
    tracks: [
      "Track 1: Software Development & SaaS platforms",
      "Track 2: Mobile UI/UX designs and Figma prototypes"
    ],
    benefits: [
      "Prizes worth ₹1 Lakh",
      "Certificates of excellence",
      "Incubation support at Acropolis Innovation Centre"
    ],
    tags: ["Web Dev", "Open Innovation"],
    mode: "Offline",
    scale: "National",
    registrationDeadline: "2026-09-23T23:59:59Z",
    date: "September 26-27, 2026",
    url: "https://unstop.com/hackathons/ikigai-2026-acropolis-institute-of-technology-and-research-indore-1703362",
    isApplied: false,
    timeline: [
      {
        stageName: "Round 1: Online Idea Submission",
        status: "Pending",
        deadline: "2026-09-25T23:59:59Z",
        details: "Submission\n• Upload one PPT/PPTX/PDF per team.\n• Focus on innovation, feasibility, and scalability.\n\nImportant\n• Only registered teams are eligible.\n• Each team must have at least one female participant.\n• Shortlisted teams will qualify for the 36-hour offline finale (21-23 Oct 2026).\n\nAttachments\n• PPT Template : Link\n• Problem Statement For Round 1 : Link\n• Maximum 12 Slides",
        fileNameRequired: "proposal_deck.pdf"
      },
      {
        stageName: "Screening & Shortlisting",
        status: "Pending",
        deadline: "2026-10-05T00:00:00Z",
        details: "All submissions received during Round 1 will be reviewed by the evaluation panel. Teams will be assessed based on innovation, problem understanding, technical approach, feasibility, scalability, and potential impact.\n\nBased on the evaluation, shortlisted teams will be selected to participate in the Grand Finale of IKIGAI 2026. The decision of the judges will be final and binding. Shortlisted teams will be notified through Unstop & Through Mail."
      },
      {
        stageName: "Round 2: Grand Finale – Offline Hackathon",
        status: "Pending",
        deadline: "2026-10-23T00:00:00Z",
        details: "Teams shortlisted from Round 1 will qualify for the Grand Finale of IKIGAI 2026. The finale will be a 36-hour offline hackathon conducted from 21-23 October 2026. Shortlisted teams will build, develop, and present their solutions before a panel of judges.\n\nParticipants will be evaluated on innovation, technical implementation, scalability, impact, presentation, and overall execution."
      }
    ]
  },
  {
    id: "h4",
    title: "Microsoft Imagine Cup 2026",
    host: "Microsoft Corp",
    platform: "Devpost",
    description: "Empowering student developers to use AI and Azure to create technologies that make a difference in the world.",
    fee: 0,
    teamSize: "1 - 4 Members",
    postedDate: "May 10, 2026",
    registeredCount: 1250,
    locationText: "Online",
    aboutText: "For more than 20 years, the Imagine Cup has been the premier global student technology competition. Students form teams of up to four to build tech solutions using AI, Azure Cloud, and developer API stacks to address global issues.",
    tracks: [
      "Category 1: Earth & Climate Solutions",
      "Category 2: Education Accessibility",
      "Category 3: Healthcare Innovation",
      "Category 4: Lifestyle & Community"
    ],
    benefits: [
      "$100,000 Grand Prize",
      "Mentorship with Microsoft CEO Satya Nadella",
      "Azure Credits up to $10,000 per student team"
    ],
    tags: ["AI", "Healthcare", "Open Innovation"],
    mode: "Online",
    scale: "International",
    registrationDeadline: "2026-10-15T23:59:59Z",
    date: "Sept - Oct, 2026",
    url: "https://imaginecup.microsoft.com",
    isApplied: false
  },
  {
    id: "h5",
    title: "Hack4Bengal 2026",
    host: "H4B Organizing Committee",
    platform: "Devfolio",
    description: "Eastern India's largest community hackathon supporting developers and innovators across fields.",
    fee: 0,
    teamSize: "2 - 4 Members",
    postedDate: "Aug 01, 2026",
    registeredCount: 380,
    locationText: "Kolkata, West Bengal, India",
    aboutText: "Hack4Bengal has grown into Bengal's premier coding arena. Formed by community leaders, it provides mentorship, networking workshops, physical workspaces, and resources for 36 hours of software development.",
    tracks: [
      "Track 1: Web3 and Decentralized Apps",
      "Track 2: AI & LLM workflows",
      "Track 3: Open Innovation & Social Good"
    ],
    benefits: [
      "Prizes worth ₹3 Lakhs",
      "Cool developer merchandise (T-Shirts, Stickers, Keychains)",
      "Vercel, GitHub, and Auth0 credit coupons"
    ],
    tags: ["Web Dev", "AI", "Blockchain"],
    mode: "Offline",
    scale: "National",
    registrationDeadline: "2026-08-29T23:59:59Z",
    date: "September 12-14, 2026",
    url: "https://hack4bengal.tech",
    isApplied: true,
    timeline: [
      { stageName: "Registration", status: "Completed", details: "Successfully registered" },
      { stageName: "Project Idea Submission", status: "Pending", deadline: "2026-08-28T23:59:59Z", daysLeft: 1, details: "Submit initial github repo & architecture document", fileNameRequired: "project_architecture.pdf", fileUploaded: false },
      { stageName: "Result Announcement", status: "Not Yet", deadline: "2026-09-02T12:00:00Z", details: "Shortlisted teams for physical hack" }
    ]
  },
  {
    id: "h6",
    title: "NASA Space Apps Challenge 2026",
    host: "NASA",
    platform: "NASA Space Apps Challenge",
    description: "The world's largest space & science hackathon utilizing NASA open datasets to solve earthly and cosmic issues.",
    fee: 0,
    teamSize: "1 - 6 Members",
    postedDate: "Aug 15, 2026",
    registeredCount: 8900,
    locationText: "Hybrid / Global Local Chapters",
    aboutText: "The Space Apps Challenge is an international hackathon for coders, scientists, designers, storytellers, makers, builders, technologists, and space enthusiasts. Teams use free NASA open data to tackle real-world problems on Earth and in space.",
    tracks: [
      "Challenge A: Mapping Cosmic Dust Clouds",
      "Challenge B: Earth Observation for Climate Disasters",
      "Challenge C: Space Colony Resource Management simulation"
    ],
    benefits: [
      "Invitation to NASA Kennedy Space Center in Florida",
      "NASA Global Winner certificate",
      "Publicity in NASA official channels"
    ],
    tags: ["Open Innovation", "IoT"],
    mode: "Online",
    scale: "International",
    registrationDeadline: "2026-09-01T23:59:59Z",
    date: "October 3-4, 2026",
    url: "https://spaceappschallenge.org",
    isApplied: false
  },
  {
    id: "h7",
    title: "ETHGlobal Brussels 2026",
    host: "ETHGlobal",
    platform: "ETHGlobal",
    description: "Assemble a team, develop a Web3 solution, and pitch to leading blockchain founders in Europe.",
    fee: 0,
    teamSize: "1 - 5 Members",
    postedDate: "Aug 10, 2026",
    registeredCount: 540,
    locationText: "Brussels, Belgium",
    aboutText: "ETHGlobal events bring together the top Ethereum developers, designers, and researchers. Over 36 hours, you will build blockchain prototypes using EVM networks, smart contracts, Layer-2 scaling layers, and zero-knowledge proofs.",
    tracks: [
      "Sponsor Tracks: Optimism, Arbitrum, Base, Uniswap Hooks, Chainlink CCIP integrations"
    ],
    benefits: [
      "$50,000 in sponsor bounty pools",
      "Networking with top crypto VC funds",
      "Free hacker breakfast, lunch, and dinner"
    ],
    tags: ["Blockchain", "Web Dev"],
    mode: "Offline",
    scale: "International",
    registrationDeadline: "2026-09-05T23:59:59Z",
    date: "September 10-12, 2026",
    url: "https://ethglobal.com",
    isApplied: false
  },
  {
    id: "h8",
    title: "Smart India Hackathon (SIH) 2026",
    host: "Ministry of Education, Gov of India",
    platform: "Unstop",
    description: "Nationwide initiative to provide students a platform to solve pressing problems of daily lives.",
    fee: 0,
    teamSize: "6 Members",
    postedDate: "Aug 20, 2026",
    registeredCount: 45000,
    locationText: "Hybrid (Grand Finale Offline at Nodal Centres)",
    aboutText: "Smart India Hackathon is a unique initiative to identify new digital technologies to solve various issues faced by ministries and public departments. Involves hardware and software divisions with thousands of colleges taking part.",
    tracks: [
      "Track 1: Smart Vehicles & Intelligent Transport Systems",
      "Track 2: Renewable Energy & Smart Grid models",
      "Track 3: Cybersecurity solutions for Government portals"
    ],
    benefits: [
      "₹1 Lakh cash award per problem statement",
      "National media recognition",
      "Incubation support from AICTE"
    ],
    tags: ["Open Innovation", "Cybersecurity", "Hardware"],
    mode: "Offline",
    scale: "National",
    registrationDeadline: "2026-09-30T23:59:59Z",
    date: "September 12-15, 2026",
    url: "https://sih.gov.in",
    isApplied: false
  },
  {
    id: "h9",
    title: "Devfolio BuildIndia Hackathon",
    host: "Devfolio Community",
    platform: "Devfolio",
    description: "Support builders in solving real-world Indian infrastructural challenges using software.",
    fee: 0,
    teamSize: "1 - 4 Members",
    postedDate: "Aug 18, 2026",
    registeredCount: 1800,
    locationText: "Online",
    aboutText: "BuildIndia by Devfolio targets localized software problems. From hyper-local logistics optimization to state-wise agricultural dashboard systems, you are encouraged to construct usable open-source applications.",
    tracks: [
      "Track 1: Rural Tech & Agricultural logistics",
      "Track 2: UPI integrations & Microfinance utilities"
    ],
    benefits: [
      "Bounty pools worth ₹2 Lakhs",
      "Access to Devfolio Fellowship shortlist",
      "Vercel Pro coupons"
    ],
    tags: ["Web Dev", "Open Innovation"],
    mode: "Online",
    scale: "National",
    registrationDeadline: "2026-09-15T23:59:59Z",
    date: "September 18-20, 2026",
    url: "https://devfolio.co",
    isApplied: false
  },
  {
    id: "h10",
    title: "MLH Init 2026",
    host: "Major League Hacking",
    platform: "MLH Events",
    description: "The global celebration that kicks off the 2026 hackathon season with workshops, panels, and projects.",
    fee: 0,
    teamSize: "1 - 4 Members",
    postedDate: "Aug 22, 2026",
    registeredCount: 12400,
    locationText: "Online / Global chapters",
    aboutText: "Init is MLH's flagship kickoff week. Includes coding mini-challenges, technical workshops hosted by GitHub/Google, and community building calls for high school and university students alike.",
    tracks: [
      "Category 1: Best Beginner Hack",
      "Category 2: Best Use of GitHub Copilot Workspace"
    ],
    benefits: [
      "Custom MLH seasons stickers & t-shirts",
      "GitHub global student benefits activation",
      "Speaker sessions with senior FAANG engineers"
    ],
    tags: ["Web Dev", "Open Innovation"],
    mode: "Online",
    scale: "International",
    registrationDeadline: "2026-09-12T23:59:59Z",
    date: "September 15-22, 2026",
    url: "https://mlh.io",
    isApplied: false
  },
  {
    id: "h11",
    title: "Kaggle Climate Change Analytics Challenge",
    host: "Kaggle Competitions",
    platform: "Kaggle Competitions",
    description: "Analyze global climate metrics and forecast anomalies using ML models.",
    fee: 0,
    teamSize: "Solo",
    postedDate: "Aug 12, 2026",
    registeredCount: 3800,
    locationText: "Online",
    aboutText: "A data science competition where teams build predictive models using satellite temperature indexes, solar radiation records, and carbon emission stats. Leaderboard is evaluated on root-mean-squared error (RMSE).",
    tracks: [
      "Evaluation Track: Predict monthly heat trends with highest RMSE accuracy"
    ],
    benefits: [
      "Kaggle Contributor/Expert profile progression points",
      "Co-authorship on paper submissions",
      "$15,000 total prize pool"
    ],
    tags: ["AI", "Open Innovation"],
    mode: "Online",
    scale: "International",
    registrationDeadline: "2026-10-20T23:59:59Z",
    date: "Oct - Sept, 2026",
    url: "https://kaggle.com",
    isApplied: false
  },
  {
    id: "h12",
    title: "Google Solution Challenge 2026",
    host: "Google Developer Groups (GDG)",
    platform: "Google Developer Groups",
    description: "Build a solution to one or more of the United Nations 17 Sustainable Development Goals using Google tech.",
    fee: 0,
    teamSize: "1 - 4 Members",
    postedDate: "May 25, 2026",
    registeredCount: 8900,
    locationText: "Online",
    aboutText: "The GDSC Solution Challenge invites students to build software systems that create real impact in local communities. Submissions must incorporate Google technologies like Firebase, Flutter, Google Cloud Platform, or TensorFlow.",
    tracks: [
      "Goal Track: UN Sustainable Development Goals solutions"
    ],
    benefits: [
      "Mentorship from Google Engineers",
      "Cash awards up to $3,000 per developer",
      "Feature spot on Google Developer YouTube channel"
    ],
    tags: ["AI", "Web Dev", "Open Innovation"],
    mode: "Online",
    scale: "International",
    registrationDeadline: "2026-09-10T23:59:59Z",
    date: "Sept - Oct, 2026",
    url: "https://developers.google.com",
    isApplied: false
  },
  {
    id: "h13",
    title: "CyberSafe India Security Hackathon",
    host: "Ministry of Home Affairs / Hack2Skill",
    platform: "Hack2Skill",
    description: "Solve key cyber challenges like dark web monitoring, phishing analyzers, and network firewalls.",
    fee: 250,
    teamSize: "2 - 4 Members",
    postedDate: "Aug 24, 2026",
    registeredCount: 950,
    locationText: "Online (Finals at Delhi Police HQ)",
    aboutText: "Hack2Skill collaborates with government divisions to organize CyberSafe India. The focus is to address modern financial fraud, deepfake detection, and cryptographic protocols for public networks.",
    tracks: [
      "Track A: Financial Phishing Analysis tool",
      "Track B: AI-based Deepfake audio filter"
    ],
    benefits: [
      "Internship offers with cybercrime cells",
      "Prizes worth ₹2.5 Lakhs",
      "Gov Cyber Warrior certification"
    ],
    tags: ["Cybersecurity", "AI"],
    mode: "Online",
    scale: "National",
    registrationDeadline: "2026-09-28T23:59:59Z",
    date: "October 10-12, 2026",
    url: "https://hack2skill.com",
    isApplied: false
  },
  {
    id: "h14",
    title: "DoraHacks AI Agent Marathon",
    host: "DoraHacks",
    platform: "DoraHacks",
    description: "Launch functional multi-agent workflows using zero-knowledge identity and decentralized hosting.",
    fee: 0,
    teamSize: "1 - 5 Members",
    postedDate: "Aug 15, 2026",
    registeredCount: 420,
    locationText: "Online",
    aboutText: "DoraHacks is a global developer sandbox. This marathon targets autonomous AI workflows that interface with Web3. Build LLM pipelines that execute smart contracts or manage wallet transactions under secure cryptographic layers.",
    tracks: [
      "Track 1: LangGraph & Eliza Multi-Agent Networks",
      "Track 2: Decentralized AI node orchestration"
    ],
    benefits: [
      "$40,000 in Gitcoin-style quadratic funding pools",
      "Direct grant opportunities from blockchain projects"
    ],
    tags: ["AI", "Blockchain"],
    mode: "Online",
    scale: "International",
    registrationDeadline: "2026-09-19T23:59:59Z",
    date: "September 24-26, 2026",
    url: "https://dorahacks.io",
    isApplied: false
  },
  {
    id: "h15",
    title: "AngelHack Global Hackathon Series",
    host: "AngelHack",
    platform: "AngelHack",
    description: "A fast-paced developer hackathon series connecting global talent with Silicon Valley mentors.",
    fee: 0,
    teamSize: "2 - 5 Members",
    postedDate: "Aug 02, 2026",
    registeredCount: 1250,
    locationText: "Offline Chapters (Bangalore City centre)",
    aboutText: "AngelHack's flagship challenge has returned to India. Form a team, refine a pitch, and code a functional software prototype in 30 hours. Winners are fast-tracked into the AngelHack startup accelerator program.",
    tracks: [
      "Category 1: FinTech & Open Banking APIs",
      "Category 2: Sustainable Urban Mobility algorithms"
    ],
    benefits: [
      "Silicon Valley accelerator entry options",
      "Airfare tickets to Singapore Global Finals",
      "Amazon Web Services (AWS) credits worth $5,000"
    ],
    tags: ["Open Innovation", "Web Dev"],
    mode: "Offline",
    scale: "International",
    registrationDeadline: "2026-09-08T23:59:59Z",
    date: "September 18-19, 2026",
    url: "https://angelhack.com",
    isApplied: false
  }
];

export const initialInternships: Internship[] = [
  {
    id: "i1",
    title: "STEP Intern (Software Engineering)",
    host: "Google",
    company: "Google",
    role: "STEP Intern (Software Engineering)",
    platform: "Google Careers",
    description: "A 12-week developmental internship for second-year CS undergraduate students.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 4500,
    locationText: "Google Office, Bangalore/Hyderabad, India",
    aboutText: "Google STEP (Student Training in Engineering Program) focuses on providing CS engineering students with practical software engineering experience. Interns work in pairs alongside full-time Googlers on product projects, and receive technical and professional mentoring.",
    tracks: [
      "Module 1: Production Coding in C++, Java, or Go",
      "Module 2: System Design & Algorithm Optimization",
      "Module 3: Code Review and Unit Testing"
    ],
    benefits: [
      "Stipend of ₹1,00,000 per month",
      "Google Cafeteria meals, snacks, and drinks",
      "High probability of return intern/full-time offer conversion"
    ],
    stipend: "₹1,00,000/mo",
    stipendValue: 100000,
    location: "On-site",
    field: "Software",
    deadline: "2026-09-02T23:59:59Z",
    url: "https://careers.google.com/jobs/results/?q=STEP%20Intern",
    isApplied: true,
    timeline: [
      { stageName: "Resume Screen", status: "Completed", details: "Shortlisted for OA" },
      { stageName: "Online Assessment", status: "Pending", deadline: "2026-08-29T23:59:59Z", daysLeft: 2, details: "2 Coding questions on DSA" }
    ]
  },
  {
    id: "i2",
    title: "SDE Intern",
    host: "Amazon",
    company: "Amazon",
    role: "SDE Intern",
    platform: "Amazon Jobs",
    description: "Tackle real-world software problems, database optimization, and cloud deployments.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 3200,
    locationText: "Amazon Office, Chennai/Bangalore, India",
    aboutText: "Amazon SDE interns own specific feature components in active service pipelines. You will write code, deploy via AWS, perform code reviews, and participate in sprint planning under the guidance of a dedicated mentor.",
    tracks: [
      "Module 1: Microservices development on AWS EC2 & DynamoDB",
      "Module 2: Unit testing and CI/CD pipeline automation"
    ],
    benefits: [
      "Stipend of ₹80,000 per month",
      "Amazon employee discount voucher",
      "Relocation allowances"
    ],
    stipend: "₹80,000/mo",
    stipendValue: 80000,
    location: "Hybrid",
    field: "Software",
    deadline: "2026-09-05T23:59:59Z",
    url: "https://www.amazon.jobs/en/job_categories/software-development",
    isApplied: true,
    timeline: [
      { stageName: "Resume Screen", status: "Completed" },
      { stageName: "Technical Interview 1", status: "Pending", deadline: "2026-08-30T10:00:00Z", daysLeft: 3, details: "DSA + Leadership Principles" },
      { stageName: "Technical Interview 2", status: "Not Yet", details: "Final round interview" }
    ]
  },
  {
    id: "i3",
    title: "AI Agent Engineering Intern",
    host: "Zephyr AI",
    company: "Zephyr AI",
    role: "AI Agent Engineering Intern",
    platform: "Wellfound",
    description: "Build, configure, and evaluate LLM agent workflows using LangChain and Python.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 120,
    locationText: "Remote (San Francisco / Bangalore startup)",
    aboutText: "Zephyr AI is an early-stage startup developing autonomous coding agents. As an intern, you will benchmark agent prompts, evaluate fine-tuned LLMs, write integration logic, and build streamlit UI playgrounds.",
    tracks: [
      "Module 1: LLM Tool calling & prompt orchestration using LangGraph",
      "Module 2: RAG database configuration using Vector databases"
    ],
    benefits: [
      "Stipend of ₹45,000 per month",
      "Flexible working hours and 100% remote layout",
      "Equity grant options if hired full-time"
    ],
    stipend: "₹45,000/mo",
    stipendValue: 45000,
    location: "Remote",
    field: "AI",
    deadline: "2026-09-18T23:59:59Z",
    url: "https://wellfound.com/jobs",
    isApplied: false
  },
  {
    id: "i4",
    title: "Space Science Intern",
    host: "ISRO",
    company: "ISRO",
    role: "Space Science Intern",
    platform: "ISRO Portal",
    description: "Analyze telemetry logs, orbital simulations, and embedded satellite controller systems.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 150,
    locationText: "Vikram Sarabhai Space Centre (VSSC), Thiruvananthapuram, India",
    aboutText: "ISRO offers research internships to meritorious engineering students. Interns assist scientists in space physics modeling, flight controller software verification, and analyzing telemetry payload streams.",
    tracks: [
      "Module 1: Digital Signal Processing & Telemetry parsing in MATLAB/C",
      "Module 2: Real-time Operating Systems (RTOS) embedded modules"
    ],
    benefits: [
      "Stipend of ₹25,000 per month",
      "Letter of Recommendation from ISRO Scientist",
      "Access to official launch pad visits"
    ],
    stipend: "₹25,000/mo",
    stipendValue: 25000,
    location: "On-site",
    field: "ECE",
    deadline: "2026-09-10T23:59:59Z",
    url: "https://www.isro.gov.in/Careers.html",
    isApplied: false
  },
  {
    id: "i5",
    title: "Defense Embedded Systems Intern",
    host: "DRDO",
    company: "DRDO",
    role: "Defense Embedded Systems Intern",
    platform: "DRDO Careers",
    description: "Write low-level assembly/C drivers for microcontroller sensor integrations.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 95,
    locationText: "LRDE Lab, DRDO, Bangalore, India",
    aboutText: "LRDE (Electronics & Radar Development Establishment) DRDO lab offers internships for students to learn about radar electronics and embedded hardware systems. Interns write drivers for ARM Cortex chips and interface microwave sensors.",
    tracks: [
      "Module 1: I2C/SPI Sensor interfacing in C",
      "Module 2: Oscilloscope testing & hardware validation"
    ],
    benefits: [
      "Stipend of ₹20,000 per month",
      "DRDO Defense Lab training certificate",
      "Interaction with defense scientists"
    ],
    stipend: "₹20,000/mo",
    stipendValue: 20000,
    location: "On-site",
    field: "ECE",
    deadline: "2026-09-08T23:59:59Z",
    url: "https://www.drdo.gov.in/careers",
    isApplied: false
  },
  {
    id: "i6",
    title: "React Frontend Developer Intern",
    host: "PixelForge Tech",
    company: "PixelForge Tech",
    role: "React Frontend Developer Intern",
    platform: "Internshala",
    description: "Work on responsive web applications using ReactJS, TailwindCSS, and state management.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 180,
    locationText: "Remote (India)",
    aboutText: "PixelForge Tech is a digital design studio. We are looking for React frontend interns to help us build progressive web apps. You will collaborate with Figma designers to build interactive user interfaces.",
    tracks: [
      "Module 1: Component design using TailwindCSS",
      "Module 2: Dynamic state wiring with Redux Toolkit"
    ],
    benefits: [
      "Stipend of ₹15,000 per month",
      "Flexible hours certificate",
      "Letter of Recommendation"
    ],
    stipend: "₹15,000/mo",
    stipendValue: 15000,
    location: "Remote",
    field: "Software",
    deadline: "2026-09-15T23:59:59Z",
    url: "https://internshala.com",
    isApplied: false
  },
  {
    id: "i7",
    title: "Python Backend Intern",
    host: "Codex Solutions",
    company: "Codex Solutions",
    role: "Python Backend Intern",
    platform: "Indeed",
    description: "Configure RESTful APIs using Django, PostgreSQL, and write unit test scripts.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 240,
    locationText: "Bangalore, India",
    aboutText: "Codex develops ERP SaaS plugins for corporate management. Interns will assist the backend engineering team in optimizing database queries, configuring Redis caching, and refactoring API endpoints.",
    tracks: [
      "Module 1: Django ORM optimizations & queries",
      "Module 2: PyTest automation testing suites"
    ],
    benefits: [
      "Stipend of ₹25,000 per month",
      "Free office snacks and community gaming zone access"
    ],
    stipend: "₹25,000/mo",
    stipendValue: 25000,
    location: "On-site",
    field: "Software",
    deadline: "2026-09-11T23:59:59Z",
    url: "https://www.indeed.com",
    isApplied: false
  },
  {
    id: "i8",
    title: "TCS Digital Intern",
    host: "Tata Consultancy Services",
    company: "TCS",
    role: "TCS Digital Intern",
    platform: "TCS Careers",
    description: "Explore industrial enterprise tools, IoT deployments, and basic cloud instances.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 890,
    locationText: "TCS Synergy Park, Hyderabad, India",
    aboutText: "The TCS Digital internship offers senior year candidates exposure to real-world industrial projects. You will analyze production datasets, configure basic AWS instances, and learn enterprise DevOps practices.",
    tracks: [
      "Module 1: Cloud instances configuration & Docker",
      "Module 2: Industrial datasets analytics"
    ],
    benefits: [
      "Stipend of ₹18,000 per month",
      "Direct conversion to TCS Digital full-time associate (salary package: ₹7.5 LPA) post evaluation"
    ],
    stipend: "₹18,000/mo",
    stipendValue: 18000,
    location: "On-site",
    field: "Software",
    deadline: "2026-09-28T23:59:59Z",
    url: "https://www.tcs.com/careers",
    isApplied: false
  },
  {
    id: "i9",
    title: "Code for GovTech Fellowship",
    host: "Samagra Governance",
    company: "Samagra Governance",
    role: "Code for GovTech Fellow",
    platform: "Code for GovTech",
    description: "A premium open-source fellowship building digital public goods for millions of citizens.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 840,
    locationText: "Remote (India)",
    aboutText: "C4GT is an initiative to create a community of coders focused on Digital Public Infrastructure (DPI) in India. Fellows work on projects like DIGIT, Sunbird, or Beckn under the guidance of leading tech architects.",
    tracks: [
      "Module 1: Building microservices for public education/health portals",
      "Module 2: Open-source community code contributions"
    ],
    benefits: [
      "Stipend of ₹35,000 per month",
      "National mentorship & digital public goods certificate"
    ],
    stipend: "₹35,000/mo",
    stipendValue: 35000,
    location: "Remote",
    field: "Software",
    deadline: "2026-09-12T23:59:59Z",
    url: "https://www.c4gt.in/",
    isApplied: false
  },
  {
    id: "i10",
    title: "AICTE National Cybersecurity Intern",
    host: "AICTE / CyberCell India",
    company: "AICTE CyberCell",
    role: "AICTE National Cybersecurity Intern",
    platform: "AICTE Internship Portal",
    description: "Conduct network auditing, log inspection, and verify safety checklists for government servers.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 1540,
    locationText: "Remote (India)",
    aboutText: "Organized by AICTE to foster cyber security literacy among engineering undergraduates. Interns will go through cybersecurity audits, learn threat vector analysis, and write server vulnerability logs.",
    tracks: [
      "Module 1: Network packet sniffing & OWASP Top 10 audits",
      "Module 2: Log analytics using Splunk/Wireshark tools"
    ],
    benefits: [
      "Stipend of ₹12,000 per month",
      "National AICTE verified internship certificate"
    ],
    stipend: "₹12,000/mo",
    stipendValue: 12000,
    location: "Remote",
    field: "ECE",
    deadline: "2026-09-20T23:59:59Z",
    url: "https://internship.aicte-india.org/",
    isApplied: false
  }
];

export const initialScholarships: Scholarship[] = [
  {
    id: "s1",
    title: "National Scholarship Portal (NSP)",
    host: "Ministry of Minority Affairs / Gov of India",
    name: "National Scholarship Portal (NSP)",
    provider: "Ministry of Minority Affairs / Gov of India",
    platform: "NSP Portal",
    description: "Central government post-matric scholarships for technical degree courses.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 85000,
    locationText: "New Delhi, India (Verified Online)",
    aboutText: "NSP is a digital gateway for Central Government, State Government, and AICTE scholarship schemes. This post-matric scheme covers tuition reimbursement and study allowances for OBC/SC/ST/Minority engineering candidates.",
    tracks: [
      "Step 1: Aadhaar Integration & Domicile Check",
      "Step 2: Institute Node Verification",
      "Step 3: State Board Final Approvals"
    ],
    benefits: [
      "Full college tuition fee reimbursement (up to ₹50,000 per year)",
      "Monthly maintenance allowance of ₹1,200 for hostellers"
    ],
    amount: "₹50,000/yr",
    deadline: "2026-10-30T23:59:59Z",
    url: "https://scholarships.gov.in/",
    isApplied: false,
    eligibility: {
      categories: ["OBC", "SC", "ST", "Minority"],
      incomeLimit: 250000,
      states: ["All"],
      genders: ["All"],
      degrees: ["BTech", "MBA", "MCA", "Diploma"],
      years: ["All"]
    }
  },
  {
    id: "s2",
    title: "Reliance Foundation Undergraduate Scholarship",
    host: "Reliance Foundation",
    name: "Reliance Foundation Undergraduate Scholarship",
    provider: "Reliance Foundation",
    platform: "Reliance Foundation Scholarships",
    description: "Merit-cum-means financial aid supporting students in engineering and technology fields.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 1540,
    locationText: "Mumbai, India (Foundation Board Office)",
    aboutText: "Reliance Foundation Scholarships aim to nurture young minds to solve India's developmental challenges. Offers up to ₹2 Lakh over the duration of the degree, coupled with leadership lectures and student network access.",
    tracks: [
      "Step 1: Online Aptitude Assessment (Math/Logic/Verbal)",
      "Step 2: Evaluation of Socio-Economic certificates",
      "Step 3: Interview with Board members"
    ],
    benefits: [
      "Total grant of ₹2,00,000 paid over BTech duration",
      "Participation in annual youth leadership summit",
      "Access to Reliance alumni group"
    ],
    amount: "₹2,00,000/yr",
    deadline: "2026-09-04T23:59:59Z",
    url: "https://www.scholarships.reliancefoundation.org/",
    isApplied: true,
    timeline: [
      { stageName: "Application & Docs Verified", status: "Completed", details: "All academic certificates validated" },
      { stageName: "Interview Round", status: "Pending", deadline: "2026-09-04T23:59:59Z", daysLeft: 7, details: "Personal interview with foundation board" }
    ],
    eligibility: {
      categories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
      incomeLimit: 800000,
      states: ["All"],
      genders: ["All"],
      degrees: ["BTech", "All"],
      years: ["1st", "2nd", "3rd", "4th", "All"]
    }
  },
  {
    id: "s3",
    title: "Tata Scholarship",
    host: "Tata Trusts",
    name: "Tata Scholarship",
    provider: "Tata Trusts",
    platform: "Buddy4Study",
    description: "Financial support for students in premier engineering colleges based on academic excellence and financial constraints.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 380,
    locationText: "Mumbai, India (Trusts Office)",
    aboutText: "Tata Trusts provides educational grants to candidates studying in India. Merit-cum-Means assistance supports students facing immediate financial disruption, ensuring they can complete technical higher education.",
    tracks: [
      "Step 1: Application submission and academic transcripts check",
      "Step 2: Telephonic profile verification interview"
    ],
    benefits: [
      "Grant of up to ₹1,50,000 per academic year for course fees",
      "Mentoring by Tata professionals"
    ],
    amount: "₹1,50,000/yr",
    deadline: "2026-09-20T23:59:59Z",
    url: "https://www.tatatrusts.org/our-areas/individual-grants-education/",
    isApplied: false,
    eligibility: {
      categories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
      incomeLimit: 400000,
      states: ["All"],
      genders: ["All"],
      degrees: ["BTech", "MBA", "MCA"],
      years: ["All"]
    }
  },
  {
    id: "s4",
    title: "AICTE Pragati Scholarship for Girls",
    host: "AICTE",
    name: "AICTE Pragati Scholarship for Girls",
    provider: "AICTE",
    platform: "NSP Portal",
    description: "Exclusively for female students admitted to professional degree courses.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 950,
    locationText: "AICTE Delhi, India",
    aboutText: "Pragati is an AICTE scheme to assist advancement of girls in technical education. Offering financial support to female candidates to complete technical education at engineering or polytechnic levels.",
    tracks: [
      "Step 1: Uploading rank list & admission cards on NSP",
      "Step 2: Nodal officer physical verification at college"
    ],
    benefits: [
      "₹50,000 per annum towards college fee, books, computer purchase, and equipment"
    ],
    amount: "₹50,000/yr",
    deadline: "2026-10-15T23:59:59Z",
    url: "https://www.aicte-india.org/schemes/students-development-schemes/pragati-scholarship-scheme",
    isApplied: false,
    eligibility: {
      categories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
      incomeLimit: 800000,
      states: ["All"],
      genders: ["Female"],
      degrees: ["BTech", "Diploma"],
      years: ["1st", "2nd", "3rd", "4th"]
    }
  },
  {
    id: "s5",
    title: "HDFC Bank Parivartan Scholarship",
    host: "HDFC Bank Foundation",
    name: "HDFC Bank Parivartan Scholarship",
    provider: "HDFC Bank Foundation",
    platform: "Buddy4Study",
    description: "Aims to support meritorious and needy students belonging to underprivileged sections of society.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 2300,
    locationText: "Mumbai, India (National Digital Verified)",
    aboutText: "Under the HDFC Bank Parivartan initiative, this scholarship supports students facing financial crises due to personal issues or medical emergencies, ensuring they do not drop out of professional streams.",
    tracks: [
      "Step 1: Document checklist evaluation",
      "Step 2: Direct bank transfer approval"
    ],
    benefits: [
      "Financial assistance up to ₹75,000 to cover tuition fees"
    ],
    amount: "₹75,000/yr",
    deadline: "2026-09-28T23:59:59Z",
    url: "https://www.buddy4study.com/page/hdfc-bank-parivartan-ecss-scholarship",
    isApplied: false,
    eligibility: {
      categories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
      incomeLimit: 600000,
      states: ["All"],
      genders: ["All"],
      degrees: ["BTech", "MBA", "MCA", "Diploma"],
      years: ["All"]
    }
  },
  {
    id: "s6",
    title: "Kotak Kanya Scholarship 2026",
    host: "Kotak Education Foundation",
    name: "Kotak Kanya Scholarship 2026",
    provider: "Kotak Education Foundation",
    platform: "Buddy4Study",
    description: "Financial assistance for meritorious girl students to pursue professional graduation courses.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 420,
    locationText: "Mumbai, India",
    aboutText: "Kotak Kanya Scholarship aims to empower girls from low-income families by supporting their academic aspirations. It provides financial assistance for professional courses like engineering, medicine, and architecture.",
    tracks: [
      "Step 1: Academic cutoff check (>=85% in Class 12)",
      "Step 2: Family income verification interview"
    ],
    benefits: [
      "₹1,00,000 per year towards tuition fees, hostel, and academic materials"
    ],
    amount: "₹1,00,000/yr",
    deadline: "2026-09-31T23:59:59Z",
    url: "https://www.buddy4study.com/page/kotak-kanya-scholarship",
    isApplied: false,
    eligibility: {
      categories: ["General", "OBC", "SC", "ST", "EWS", "Minority"],
      incomeLimit: 600000,
      states: ["All"],
      genders: ["Female"],
      degrees: ["BTech", "All"],
      years: ["1st"]
    }
  }
];

export const initialContests: CodingContest[] = [
  {
    id: "c1",
    title: "Codeforces Round 950 (Div. 2)",
    host: "Codeforces",
    platform: "Codeforces",
    description: "A 2-hour competitive coding sprint containing 6 mathematical and algorithmic challenges.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 15400,
    locationText: "Online (codeforces.com)",
    aboutText: "Codeforces Round 950 is an official Div. 2 contest. Rating changes will be applied to participants with rating below 2100. Contest features 6 original problems designed by Codeforces community coordinators. Problems test dynamic programming, number theory, and advanced graphs.",
    tracks: [
      "Contest duration: 2 hours",
      "Rating criteria: Div 2 (Rating < 2100)"
    ],
    benefits: [
      "Codeforces Rating adjustments",
      "Global leaderboard badges"
    ],
    date: "2026-08-28",
    time: "20:05",
    duration: "2 hrs",
    contestPlatform: "Codeforces",
    isApplied: true,
    timeline: [
      { stageName: "Registration", status: "Completed", details: "Registered for Round 950" },
      { stageName: "Contest Live", status: "Pending", deadline: "2026-08-28T20:05:00Z", daysLeft: 1, details: "Solve 6 algorithmic challenges" }
    ]
  },
  {
    id: "c2",
    title: "LeetCode Weekly Contest 400",
    host: "LeetCode",
    platform: "LeetCode",
    description: "Solve 4 programming questions in 90 minutes to rank on the international scoreboard.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 22000,
    locationText: "Online (leetcode.com)",
    aboutText: "LeetCode Weekly Contest 400 features 4 standard interview-style coding problems (1 Easy, 2 Medium, 1 Hard). Coding language support includes Python, C++, Java, JavaScript, and Go. Standard penalties apply for wrong submissions.",
    tracks: [
      "Duration: 90 Minutes",
      "Problems: 4 Algorithmic questions"
    ],
    benefits: [
      "LeetCode coins (redeemable for merchandise)",
      "Global Ranking profile update",
      "Sponsor company profile referrals"
    ],
    date: "2026-08-28",
    time: "08:00",
    duration: "1.5 hrs",
    contestPlatform: "LeetCode",
    isApplied: false
  },
  {
    id: "c3",
    title: "CodeChef Starters 139",
    host: "CodeChef",
    platform: "CodeChef",
    description: "Rating contest containing divisions for both beginners and experts.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 8400,
    locationText: "Online (codechef.com)",
    aboutText: "Starters 139 is a weekly CodeChef contest featuring Division 1, 2, 3, and 4. Beginner coders can start in Div. 4 to practice data structures and basics. Starters contests are short and fast, providing quick coding rating increments.",
    tracks: [
      "Duration: 2 hours",
      "Rating Divisions: Div 1, Div 2, Div 3, Div 4"
    ],
    benefits: [
      "CodeChef Rating adjustments",
      "CodeChef laddu points for shop rewards"
    ],
    date: "2026-08-30",
    time: "20:00",
    duration: "2 hrs",
    contestPlatform: "CodeChef",
    isApplied: false
  },
  {
    id: "c4",
    title: "HackerRank HackTheLoop",
    host: "HackerRank Community",
    platform: "HackerRank",
    description: "Solve micro-problems on loops, array pointers, and string matching.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 4200,
    locationText: "Online (hackerrank.com)",
    aboutText: "HackTheLoop is an introductory contest focused on basic scripting, regular expressions, and logical optimizations. It is an excellent test bed for freshmen and sophomores learning core programming concepts.",
    tracks: [
      "Duration: 3 hours",
      "Focus: Logic & loops syntax, string matching, array queries"
    ],
    benefits: [
      "HackerRank gold star badge",
      "Shareable LinkedIn certification"
    ],
    date: "2026-09-02",
    time: "19:00",
    duration: "3 hrs",
    contestPlatform: "HackerRank",
    isApplied: false
  },
  {
    id: "c5",
    title: "AtCoder Beginner Contest 358",
    host: "AtCoder",
    platform: "AtCoder",
    description: "An intensive beginner-friendly contest with 8 coding problems spanning math and geometry.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 6500,
    locationText: "Online (atcoder.jp)",
    aboutText: "Official AtCoder beginner round ABC 358. Tasks are graded from very simple logic puzzles to medium graph traversals. Ideal for practicing execution speed.",
    tracks: [
      "Duration: 100 Minutes",
      "Format: 8 Algorithmic problems"
    ],
    benefits: [
      "AtCoder algorithmic rating points"
    ],
    date: "2026-09-04",
    time: "17:30",
    duration: "1.6 hrs",
    contestPlatform: "AtCoder",
    isApplied: false
  },
  {
    id: "c6",
    title: "Codeforces Round 951 (Div. 1 + Div. 2)",
    host: "Codeforces",
    platform: "Codeforces",
    description: "A combined division round offering highly challenging array and dynamic programming problems.",
    fee: 0,
    teamSize: "Solo",
    registeredCount: 18400,
    locationText: "Online (codeforces.com)",
    aboutText: "Official Codeforces Round 951. Open to all ratings. Div. 1 problems are highly advanced, requiring graph network flow knowledge or centroid decomposition.",
    tracks: [
      "Duration: 2.5 hours",
      "Rating criteria: Div 1 + Div 2 Combined"
    ],
    benefits: [
      "Codeforces Rating adjustments",
      "Leaderboard ranking badge"
    ],
    date: "2026-09-05",
    time: "20:05",
    duration: "2.5 hrs",
    contestPlatform: "Codeforces",
    isApplied: false
  }
];
