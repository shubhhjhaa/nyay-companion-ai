export interface Lawyer {
  id: string;
  name: string;
  city: string;
  state: string;
  specialization: string;
  experience: number;
  languages: string[];
  barCouncilId: string;
  availability: string;
  rating: number;
  casesWon: number;
  profileImage: string;
  gender: 'male' | 'female';
}

// Using UI Avatars API for consistent, professional avatars
const getAvatarUrl = (name: string, gender: 'male' | 'female') => {
  const bgColors = ['0D9488', '6366F1', 'D97706', 'DC2626', '7C3AED', '059669'];
  const randomColor = bgColors[Math.abs(name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % bgColors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff&size=200&bold=true`;
};

export const dummyLawyers: Lawyer[] = [
  // Consumer Court Lawyers
  {
    id: "l1",
    name: "Adv. Priya Sharma",
    city: "Mumbai",
    state: "Maharashtra",
    specialization: "Consumer Court",
    experience: 12,
    languages: ["English", "Hindi", "Marathi"],
    barCouncilId: "MH/1234/2012",
    availability: "Mon-Fri, 10 AM - 6 PM",
    rating: 4.8,
    casesWon: 245,
    gender: 'female',
    profileImage: getAvatarUrl("Priya Sharma", 'female'),
  },
  {
    id: "l2",
    name: "Adv. Rajesh Kumar",
    city: "Delhi",
    state: "Delhi",
    specialization: "Consumer Court",
    experience: 15,
    languages: ["English", "Hindi", "Punjabi"],
    barCouncilId: "DL/5678/2009",
    availability: "Mon-Sat, 9 AM - 7 PM",
    rating: 4.9,
    casesWon: 312,
    gender: 'male',
    profileImage: getAvatarUrl("Rajesh Kumar", 'male'),
  },
  {
    id: "l3",
    name: "Adv. Meera Patel",
    city: "Ahmedabad",
    state: "Gujarat",
    specialization: "Consumer Court",
    experience: 8,
    languages: ["English", "Hindi", "Gujarati"],
    barCouncilId: "GJ/9012/2016",
    availability: "Mon-Fri, 11 AM - 5 PM",
    rating: 4.6,
    casesWon: 156,
    gender: 'female',
    profileImage: getAvatarUrl("Meera Patel", 'female'),
  },
  // Family Law Lawyers
  {
    id: "l4",
    name: "Adv. Sunita Reddy",
    city: "Hyderabad",
    state: "Telangana",
    specialization: "Family Law",
    experience: 18,
    languages: ["English", "Hindi", "Telugu"],
    barCouncilId: "TS/3456/2006",
    availability: "Mon-Fri, 10 AM - 6 PM",
    rating: 4.7,
    casesWon: 289,
    gender: 'female',
    profileImage: getAvatarUrl("Sunita Reddy", 'female'),
  },
  {
    id: "l5",
    name: "Adv. Vikram Singh",
    city: "Jaipur",
    state: "Rajasthan",
    specialization: "Family Law",
    experience: 10,
    languages: ["English", "Hindi"],
    barCouncilId: "RJ/7890/2014",
    availability: "Tue-Sat, 10 AM - 7 PM",
    rating: 4.5,
    casesWon: 198,
    gender: 'male',
    profileImage: getAvatarUrl("Vikram Singh", 'male'),
  },
  // Criminal Law Lawyers
  {
    id: "l6",
    name: "Adv. Arjun Menon",
    city: "Kochi",
    state: "Kerala",
    specialization: "Criminal Law",
    experience: 20,
    languages: ["English", "Hindi", "Malayalam"],
    barCouncilId: "KL/2345/2004",
    availability: "Mon-Sat, 9 AM - 8 PM",
    rating: 4.9,
    casesWon: 412,
    gender: 'male',
    profileImage: getAvatarUrl("Arjun Menon", 'male'),
  },
  {
    id: "l7",
    name: "Adv. Neha Gupta",
    city: "Lucknow",
    state: "Uttar Pradesh",
    specialization: "Criminal Law",
    experience: 14,
    languages: ["English", "Hindi", "Urdu"],
    barCouncilId: "UP/6789/2010",
    availability: "Mon-Fri, 10 AM - 6 PM",
    rating: 4.6,
    casesWon: 267,
    gender: 'female',
    profileImage: getAvatarUrl("Neha Gupta", 'female'),
  },
  // Property Disputes Lawyers
  {
    id: "l8",
    name: "Adv. Suresh Iyer",
    city: "Chennai",
    state: "Tamil Nadu",
    specialization: "Property Disputes",
    experience: 22,
    languages: ["English", "Hindi", "Tamil"],
    barCouncilId: "TN/0123/2002",
    availability: "Mon-Fri, 9 AM - 5 PM",
    rating: 4.8,
    casesWon: 356,
    gender: 'male',
    profileImage: getAvatarUrl("Suresh Iyer", 'male'),
  },
  {
    id: "l9",
    name: "Adv. Kavita Joshi",
    city: "Pune",
    state: "Maharashtra",
    specialization: "Property Disputes",
    experience: 11,
    languages: ["English", "Hindi", "Marathi"],
    barCouncilId: "MH/4567/2013",
    availability: "Mon-Sat, 10 AM - 6 PM",
    rating: 4.5,
    casesWon: 189,
    gender: 'female',
    profileImage: getAvatarUrl("Kavita Joshi", 'female'),
  },
  // Labour Law Lawyers
  {
    id: "l10",
    name: "Adv. Ramesh Agarwal",
    city: "Kolkata",
    state: "West Bengal",
    specialization: "Labour Law",
    experience: 16,
    languages: ["English", "Hindi", "Bengali"],
    barCouncilId: "WB/8901/2008",
    availability: "Mon-Fri, 10 AM - 7 PM",
    rating: 4.7,
    casesWon: 234,
    gender: 'male',
    profileImage: getAvatarUrl("Ramesh Agarwal", 'male'),
  },
  {
    id: "l11",
    name: "Adv. Pooja Nair",
    city: "Bangalore",
    state: "Karnataka",
    specialization: "Labour Law",
    experience: 9,
    languages: ["English", "Hindi", "Kannada"],
    barCouncilId: "KA/2345/2015",
    availability: "Tue-Sat, 11 AM - 6 PM",
    rating: 4.4,
    casesWon: 145,
    gender: 'female',
    profileImage: getAvatarUrl("Pooja Nair", 'female'),
  },
  // Cyber Crime Lawyers
  {
    id: "l12",
    name: "Adv. Aditya Saxena",
    city: "Noida",
    state: "Uttar Pradesh",
    specialization: "Cyber Crime",
    experience: 7,
    languages: ["English", "Hindi"],
    barCouncilId: "UP/6780/2017",
    availability: "Mon-Sat, 10 AM - 8 PM",
    rating: 4.8,
    casesWon: 112,
    gender: 'male',
    profileImage: getAvatarUrl("Aditya Saxena", 'male'),
  },
  {
    id: "l13",
    name: "Adv. Divya Krishnan",
    city: "Gurgaon",
    state: "Haryana",
    specialization: "Cyber Crime",
    experience: 6,
    languages: ["English", "Hindi", "Tamil"],
    barCouncilId: "HR/1234/2018",
    availability: "Mon-Fri, 9 AM - 6 PM",
    rating: 4.6,
    casesWon: 89,
    gender: 'female',
    profileImage: getAvatarUrl("Divya Krishnan", 'female'),
  },
  // Corporate Law Lawyers
  {
    id: "l14",
    name: "Adv. Amit Deshmukh",
    city: "Mumbai",
    state: "Maharashtra",
    specialization: "Corporate Law",
    experience: 19,
    languages: ["English", "Hindi", "Marathi"],
    barCouncilId: "MH/0987/2005",
    availability: "Mon-Fri, 9 AM - 7 PM",
    rating: 4.9,
    casesWon: 398,
    gender: 'male',
    profileImage: getAvatarUrl("Amit Deshmukh", 'male'),
  },
  {
    id: "l15",
    name: "Adv. Ritu Kapoor",
    city: "Delhi",
    state: "Delhi",
    specialization: "Corporate Law",
    experience: 13,
    languages: ["English", "Hindi"],
    barCouncilId: "DL/6543/2011",
    availability: "Mon-Sat, 10 AM - 6 PM",
    rating: 4.7,
    casesWon: 267,
    gender: 'female',
    profileImage: getAvatarUrl("Ritu Kapoor", 'female'),
  },
  // Civil Law Lawyers
  {
    id: "l16",
    name: "Adv. Manoj Tiwari",
    city: "Bhopal",
    state: "Madhya Pradesh",
    specialization: "Civil Law",
    experience: 17,
    languages: ["English", "Hindi"],
    barCouncilId: "MP/3210/2007",
    availability: "Mon-Fri, 10 AM - 5 PM",
    rating: 4.6,
    casesWon: 298,
    gender: 'male',
    profileImage: getAvatarUrl("Manoj Tiwari", 'male'),
  },
  {
    id: "l17",
    name: "Adv. Ananya Das",
    city: "Guwahati",
    state: "Assam",
    specialization: "Civil Law",
    experience: 12,
    languages: ["English", "Hindi", "Assamese"],
    barCouncilId: "AS/7654/2012",
    availability: "Mon-Sat, 9 AM - 6 PM",
    rating: 4.5,
    casesWon: 178,
    gender: 'female',
    profileImage: getAvatarUrl("Ananya Das", 'female'),
  },
  // Tax Law Lawyers
  {
    id: "l18",
    name: "Adv. Sanjay Bhatt",
    city: "Surat",
    state: "Gujarat",
    specialization: "Tax Law",
    experience: 21,
    languages: ["English", "Hindi", "Gujarati"],
    barCouncilId: "GJ/0012/2003",
    availability: "Mon-Fri, 10 AM - 6 PM",
    rating: 4.8,
    casesWon: 345,
    gender: 'male',
    profileImage: getAvatarUrl("Sanjay Bhatt", 'male'),
  },
  // Additional lawyers for better coverage
  {
    id: "l19",
    name: "Adv. Shreya Malhotra",
    city: "Chandigarh",
    state: "Punjab",
    specialization: "Family Law",
    experience: 9,
    languages: ["English", "Hindi", "Punjabi"],
    barCouncilId: "PB/5678/2015",
    availability: "Mon-Fri, 10 AM - 6 PM",
    rating: 4.6,
    casesWon: 134,
    gender: 'female',
    profileImage: getAvatarUrl("Shreya Malhotra", 'female'),
  },
  {
    id: "l20",
    name: "Adv. Deepak Verma",
    city: "Patna",
    state: "Bihar",
    specialization: "Criminal Law",
    experience: 15,
    languages: ["English", "Hindi", "Bhojpuri"],
    barCouncilId: "BR/3456/2009",
    availability: "Mon-Sat, 9 AM - 7 PM",
    rating: 4.7,
    casesWon: 278,
    gender: 'male',
    profileImage: getAvatarUrl("Deepak Verma", 'male'),
  },
];

export const getLawyerById = (id: string): Lawyer | undefined => {
  return dummyLawyers.find((lawyer) => lawyer.id === id);
};

export const getLawyersBySpecialization = (specialization: string): Lawyer[] => {
  return dummyLawyers.filter(
    (lawyer) => lawyer.specialization.toLowerCase() === specialization.toLowerCase()
  );
};

export const getLawyersByLocation = (state: string, city?: string): Lawyer[] => {
  return dummyLawyers.filter((lawyer) => {
    const stateMatch = lawyer.state.toLowerCase() === state.toLowerCase();
    if (city) {
      return stateMatch && lawyer.city.toLowerCase() === city.toLowerCase();
    }
    return stateMatch;
  });
};

export const getLawyersFiltered = (
  specialization?: string,
  state?: string,
  city?: string
): Lawyer[] => {
  return dummyLawyers.filter((lawyer) => {
    let match = true;
    if (specialization) {
      match = match && lawyer.specialization.toLowerCase() === specialization.toLowerCase();
    }
    if (state) {
      match = match && lawyer.state.toLowerCase() === state.toLowerCase();
    }
    if (city) {
      match = match && lawyer.city.toLowerCase() === city.toLowerCase();
    }
    return match;
  });
};

export const getAllSpecializations = (): string[] => {
  return [...new Set(dummyLawyers.map(l => l.specialization))];
};
