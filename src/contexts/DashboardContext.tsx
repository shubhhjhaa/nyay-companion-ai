import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi';
type Theme = 'light' | 'dark';

interface DashboardContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'logout': 'Logout',
    'welcome_back': 'Welcome back,',
    'how_can_we_help': 'How can we help you today?',
    'choose_service': 'Choose a service to get started',
    'quick_access': 'Quick Access',
    'disclaimer': 'NyayBuddy provides AI-assisted legal guidance and does not replace professional legal consultation.',
    
    // Main Features
    'find_lawyers': 'Find Lawyers',
    'find_lawyers_desc': 'Search by location and case type',
    'nyayscan': 'NyayScan',
    'nyayscan_desc': 'AI-powered case analyzer',
    'nyaymail': 'NyayMail',
    'nyaymail_desc': 'Generate legal emails with AI',
    'nyaynotice': 'NyayNotice',
    'nyaynotice_desc': 'AI Legal Notice Generator',
    
    // User Features
    'my_cases': 'My Cases',
    'my_cases_desc': 'View case history & status',
    'saved_lawyers': 'Saved Lawyers',
    'saved_lawyers_desc': 'Your favorite lawyers',
    'notifications': 'Notifications',
    'notifications_desc': 'Updates & alerts',
    'legal_dictionary': 'Legal Dictionary',
    'legal_dictionary_desc': 'Terms explained simply',
    'privacy_settings': 'Privacy Settings',
    'privacy_settings_desc': 'Data control & security',
    
    // Common
    'search': 'Search',
    'back': 'Back',
    'submit': 'Submit',
    'cancel': 'Cancel',
    'save': 'Save',
    'loading': 'Loading...',
    'send': 'Send',
    'message': 'Message',
    'type_message': 'Type a message...',
    'attach_file': 'Attach file',
    
    // NyayScan
    'describe_legal_issue': 'Describe your legal issue',
    'analyzing': 'Analyzing...',
    'case_analysis': 'Case Analysis',
    'case_type': 'Case Type',
    'urgency': 'Urgency',
    'estimated_time': 'Estimated Timeframe',
    'prerequisites': 'Prerequisites',
    'recommendations': 'Recommendations',
    'next_steps': 'Next Steps',
    'find_lawyers_btn': 'Find Lawyers',
    'new_scan': 'New Scan',
    'detailed_analysis': 'Detailed Analysis',
    
    // Settings
    'language': 'Language',
    'theme': 'Theme',
    'dark_mode': 'Dark Mode',
    'light_mode': 'Light Mode',
  },
  hi: {
    // Header
    'logout': 'लॉग आउट',
    'welcome_back': 'स्वागत है,',
    'how_can_we_help': 'आज हम आपकी कैसे मदद कर सकते हैं?',
    'choose_service': 'शुरू करने के लिए एक सेवा चुनें',
    'quick_access': 'त्वरित पहुँच',
    'disclaimer': 'न्यायबडी AI-सहायता प्राप्त कानूनी मार्गदर्शन प्रदान करता है और पेशेवर कानूनी परामर्श का विकल्प नहीं है।',
    
    // Main Features
    'find_lawyers': 'वकील खोजें',
    'find_lawyers_desc': 'स्थान और केस प्रकार से खोजें',
    'nyayscan': 'न्यायस्कैन',
    'nyayscan_desc': 'AI-संचालित केस विश्लेषक',
    'nyaymail': 'न्यायमेल',
    'nyaymail_desc': 'AI से कानूनी ईमेल बनाएं',
    'nyaynotice': 'न्यायनोटिस',
    'nyaynotice_desc': 'AI कानूनी नोटिस जनरेटर',
    
    // User Features
    'my_cases': 'मेरे केस',
    'my_cases_desc': 'केस इतिहास और स्थिति देखें',
    'saved_lawyers': 'सहेजे गए वकील',
    'saved_lawyers_desc': 'आपके पसंदीदा वकील',
    'notifications': 'सूचनाएं',
    'notifications_desc': 'अपडेट और अलर्ट',
    'legal_dictionary': 'कानूनी शब्दकोश',
    'legal_dictionary_desc': 'सरल शब्दों में समझाया गया',
    'privacy_settings': 'गोपनीयता सेटिंग्स',
    'privacy_settings_desc': 'डेटा नियंत्रण और सुरक्षा',
    
    // Common
    'search': 'खोजें',
    'back': 'वापस',
    'submit': 'जमा करें',
    'cancel': 'रद्द करें',
    'save': 'सहेजें',
    'loading': 'लोड हो रहा है...',
    'send': 'भेजें',
    'message': 'संदेश',
    'type_message': 'संदेश लिखें...',
    'attach_file': 'फ़ाइल संलग्न करें',
    
    // NyayScan
    'describe_legal_issue': 'अपनी कानूनी समस्या का वर्णन करें',
    'analyzing': 'विश्लेषण हो रहा है...',
    'case_analysis': 'केस विश्लेषण',
    'case_type': 'केस का प्रकार',
    'urgency': 'तात्कालिकता',
    'estimated_time': 'अनुमानित समयसीमा',
    'prerequisites': 'पूर्व-आवश्यकताएं',
    'recommendations': 'सिफारिशें',
    'next_steps': 'अगले कदम',
    'find_lawyers_btn': 'वकील खोजें',
    'new_scan': 'नया स्कैन',
    'detailed_analysis': 'विस्तृत विश्लेषण',
    
    // Settings
    'language': 'भाषा',
    'theme': 'थीम',
    'dark_mode': 'डार्क मोड',
    'light_mode': 'लाइट मोड',
  }
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('dashboard-language');
    return (saved as Language) || 'en';
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('dashboard-theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('dashboard-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('dashboard-theme', theme);
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <DashboardContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
