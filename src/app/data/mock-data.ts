import { Device, Loan } from '../interfaces/device.model';

export const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Meta Quest 3',
    inventoryNumber: 'VR-215',
    category: 'VR-Geräte',
    description: 'Hochmoderne VR-Brille für immersive virtuelle Erfahrungen. Ideal für Forschungszwecke, Entwicklung und Lehrzwecke im Bereich Game Design und Informatik.',
    technicalSpecs: {
      storage: '128GB',
      sensor: '256x256 pixel eye, 90/120Hz',
      accessories: ['Ladekabel', 'Reinigungstuch', 'Anleitung', 'Controller']
    },
    keywords: ['Virtual Reality', 'Immersive Technologie', 'Game Development', 'Medientechnik'],
    availability: {
      total: 8,
      available: 4,
      borrowed: 4
    },
    campusAvailability: [
      { campus: 'Campus Esslingen Flandernstraße', location: 'Medienausgabe, Schrank VR-1', available: 2, total: 4 },
      { campus: 'Campus Esslingen Stadtmitte', location: 'Geräteausgabe EG', available: 2, total: 2 },
      { campus: 'Campus Göppingen', location: 'IT-Ausgabe G-104', available: 0, total: 2 }
    ],
    loanConditions: {
      loanPeriod: '7 Tage',
      extensions: 'Nach Verfügbarkeit',
      notes: 'Bis zu 5 aktive Vormerkungen. Hinweis: Geräte müssen vollständig und funktionstüchtig zurückgegeben werden'
    }
  },
  {
    id: '2',
    name: 'Canon EOS R6 Mark II',
    inventoryNumber: 'K-401',
    category: 'Kameras',
    description: 'Professionelle Vollformat-Kamera für Foto- und Videoprojekte. Perfekt für Medienproduktion, Dokumentationen und kreative Videoprojekte.',
    technicalSpecs: {
      sensor: '24.2MP Vollformat CMOS',
      accessories: ['2x Akku', 'Ladegerät', 'SD-Karte 128GB', 'Kameratasche', 'Objektivdeckel']
    },
    keywords: ['Fotografie', 'Video', 'Medienproduktion', 'Vollformat'],
    availability: {
      total: 6,
      available: 2,
      borrowed: 4
    },
    campusAvailability: [
      { campus: 'Campus Esslingen Flandernstraße', location: 'Medienausgabe, Schrank K-2', available: 1, total: 3 },
      { campus: 'Campus Esslingen Stadtmitte', location: 'Geräteraum EG', available: 1, total: 2 },
      { campus: 'Campus Göppingen', location: 'Nicht verfügbar', available: 0, total: 1 }
    ],
    loanConditions: {
      loanPeriod: '3 Tage',
      extensions: 'Nur nach Verfügbarkeit',
      notes: 'Kaution erforderlich. Einweisung notwendig'
    }
  },
  {
    id: '3',
    name: 'HTC Vive Pro 2',
    inventoryNumber: 'VR-102',
    category: 'VR-Geräte',
    description: 'High-End VR-Headset mit präzisem Tracking und 5K-Auflösung. Ideal für anspruchsvolle VR-Anwendungen und Forschungsprojekte.',
    technicalSpecs: {
      sensor: '5K Display (2448x2448 pro Auge)',
      accessories: ['Base Stations', '2x Controller', 'Verbindungskabel', 'Gesichtspolster']
    },
    keywords: ['Virtual Reality', 'Gaming', 'Entwicklung', 'High-End'],
    availability: {
      total: 4,
      available: 1,
      borrowed: 3
    },
    campusAvailability: [
      { campus: 'Campus Esslingen Flandernstraße', location: 'Medienausgabe, Schrank VR-1', available: 1, total: 2 },
      { campus: 'Campus Esslingen Stadtmitte', location: 'Nicht verfügbar', available: 0, total: 1 },
      { campus: 'Campus Göppingen', location: 'IT-Ausgabe G-104', available: 0, total: 1 }
    ],
    loanConditions: {
      loanPeriod: '7 Tage',
      extensions: 'Max. 1 Verlängerung',
      notes: 'Vollständige Rückgabe erforderlich'
    }
  },
  {
    id: '4',
    name: 'Sony A7 IV',
    inventoryNumber: 'K-512',
    category: 'Kameras',
    description: 'Hybrid-Kamera für professionelle Foto- und Videoaufnahmen mit 33MP Sensor',
    technicalSpecs: {
      sensor: '33MP Vollformat Exmor R CMOS',
      accessories: ['3x Akku', 'Ladegerät', 'SD-Karte 256GB', 'Kameratasche', 'Fernauslöser']
    },
    keywords: ['Fotografie', 'Video', '4K', 'Hybrid'],
    availability: {
      total: 5,
      available: 3,
      borrowed: 2
    },
    campusAvailability: [
      { campus: 'Campus Esslingen Flandernstraße', location: 'Medienausgabe, Schrank K-2', available: 2, total: 3 },
      { campus: 'Campus Esslingen Stadtmitte', location: 'Geräteraum EG', available: 1, total: 2 },
      { campus: 'Campus Göppingen', location: 'Nicht verfügbar', available: 0, total: 0 }
    ],
    loanConditions: {
      loanPeriod: '3 Tage',
      extensions: 'Nur nach Verfügbarkeit',
      notes: 'Kaution erforderlich. Einweisung notwendig'
    }
  },

  {
    id: '9',
    name: 'Valve Index VR Kit',
    inventoryNumber: 'VR-305',
    category: 'VR-Geräte',
    description: 'Premium VR-System mit Finger-Tracking Controllern und 144Hz Display für maximale Immersion',
    technicalSpecs: {
      sensor: '1440x1600 pro Auge, 144Hz',
      accessories: ['2x Base Station 2.0', '2x Index Controller', 'Alle Kabel', 'Gesichtspolster']
    },
    keywords: ['Virtual Reality', 'Gaming', 'Finger Tracking', 'High Refresh Rate'],
    availability: {
      total: 3,
      available: 2,
      borrowed: 1
    },
    campusAvailability: [
      { campus: 'Campus Esslingen Flandernstraße', location: 'Medienausgabe, Schrank VR-1', available: 2, total: 2 },
      { campus: 'Campus Esslingen Stadtmitte', location: 'Nicht verfügbar', available: 0, total: 1 },
      { campus: 'Campus Göppingen', location: 'Nicht verfügbar', available: 0, total: 0 }
    ],
    loanConditions: {
      loanPeriod: '7 Tage',
      extensions: 'Max. 1 Verlängerung',
      notes: 'Vollständige Rückgabe erforderlich. Gaming-PC mit DisplayPort erforderlich'
    }
  },
  {
    id: '10',
    name: 'Sony ZV-E10',
    inventoryNumber: 'K-678',
    category: 'Kameras',
    description: 'Vlogging-Kamera mit Flip-Screen und professionellen Videofunktionen, ideal für Content Creator',
    technicalSpecs: {
      sensor: '24.2MP APS-C',
      accessories: ['2x Akku', 'Ladegerät', 'SD-Karte 128GB', 'Windschutz für Mikrofon', 'Mini-Stativ']
    },
    keywords: ['Vlogging', 'Video', 'Content Creation', 'YouTube'],
    availability: {
      total: 6,
      available: 4,
      borrowed: 2
    },
    campusAvailability: [
      { campus: 'Campus Esslingen Flandernstraße', location: 'Medienausgabe, Schrank K-3', available: 2, total: 3 },
      { campus: 'Campus Esslingen Stadtmitte', location: 'Geräteraum EG', available: 2, total: 2 },
      { campus: 'Campus Göppingen', location: 'IT-Ausgabe G-104', available: 0, total: 1 }
    ],
    loanConditions: {
      loanPeriod: '3 Tage',
      extensions: 'Nach Verfügbarkeit',
      notes: 'Kaution erforderlich'
    }
  },
  {
    id: '11',
    name: 'Audio-Recorder Zoom H6',
    inventoryNumber: 'A-201',
    category: 'Audio-Equipment',
    description: 'Professioneller 6-Kanal Audio-Recorder für Podcasts, Interviews und Musikaufnahmen',
    technicalSpecs: {
      accessories: ['4x XLR-Mikrofon', 'Windschutz-Set', 'SD-Karte 128GB', 'Kopfhörer', 'Transporttasche', 'Batterien']
    },
    keywords: ['Audio', 'Podcast', 'Recording', 'Interview'],
    availability: {
      total: 5,
      available: 3,
      borrowed: 2
    },
    campusAvailability: [
      { campus: 'Campus Esslingen Flandernstraße', location: 'Medienausgabe, Schrank A-1', available: 2, total: 3 },
      { campus: 'Campus Esslingen Stadtmitte', location: 'Geräteraum EG', available: 1, total: 2 },
      { campus: 'Campus Göppingen', location: 'Nicht verfügbar', available: 0, total: 0 }
    ],
    loanConditions: {
      loanPeriod: '7 Tage',
      extensions: 'Nach Verfügbarkeit',
      notes: 'Mikrofone müssen sorgfältig behandelt werden'
    }
  },
  {
    id: '12',
    name: 'Lichtset Aputure 300d II',
    inventoryNumber: 'L-450',
    category: 'Licht-Equipment',
    description: 'Professionelles LED-Lichtset für Video- und Fotoproduktionen mit Softbox und Stativ',
    technicalSpecs: {
      accessories: ['300W LED-Leuchte', 'Softbox 90x90cm', 'Lichtstativ 3m', 'Controller', 'Farbfilter-Set', 'Transportkoffer']
    },
    keywords: ['Licht', 'Video', 'Foto', 'Studio'],
    availability: {
      total: 4,
      available: 2,
      borrowed: 2
    },
    campusAvailability: [
      { campus: 'Campus Esslingen Flandernstraße', location: 'Medienausgabe, Schrank L-2', available: 1, total: 2 },
      { campus: 'Campus Esslingen Stadtmitte', location: 'Geräteraum EG', available: 1, total: 2 },
      { campus: 'Campus Göppingen', location: 'Nicht verfügbar', available: 0, total: 0 }
    ],
    loanConditions: {
      loanPeriod: '3 Tage',
      extensions: 'Nur nach Verfügbarkeit',
      notes: 'Kaution erforderlich. Equipment ist schwer und unhandlich'
    }
  },
  {
    id: '13',
    name: 'Gimbal DJI RS3',
    inventoryNumber: 'G-301',
    category: 'Kamera-Zubehör',
    description: '3-Achsen Gimbal-Stabilisator für professionelle, verwacklungsfreie Kameraaufnahmen',
    technicalSpecs: {
      accessories: ['Gimbal DJI RS3', 'Schnellwechselplatte', '2x Akku', 'Ladegerät', 'Transportkoffer', 'Griff-Erweiterung']
    },
    keywords: ['Gimbal', 'Stabilisierung', 'Video', 'Cinematografie'],
    availability: {
      total: 4,
      available: 2,
      borrowed: 2
    },
    campusAvailability: [
      { campus: 'Campus Esslingen Flandernstraße', location: 'Medienausgabe, Schrank G-1', available: 1, total: 2 },
      { campus: 'Campus Esslingen Stadtmitte', location: 'Geräteraum EG', available: 1, total: 2 },
      { campus: 'Campus Göppingen', location: 'Nicht verfügbar', available: 0, total: 0 }
    ],
    loanConditions: {
      loanPeriod: '3 Tage',
      extensions: 'Nach Verfügbarkeit',
      notes: 'Einweisung empfohlen. Kaution erforderlich'
    }
  },
  {
    id: '14',
    name: 'Meta Quest Pro',
    inventoryNumber: 'VR-401',
    category: 'VR-Geräte',
    description: 'Business-VR-Headset mit Eye-Tracking und Mixed-Reality-Funktionen für professionelle Anwendungen',
    technicalSpecs: {
      storage: '256GB',
      sensor: 'Eye Tracking, Face Tracking, Mixed Reality',
      accessories: ['Controller Pro', 'Ladekabel', 'Ladestation', 'Reinigungsset']
    },
    keywords: ['Virtual Reality', 'Mixed Reality', 'Business', 'Eye Tracking'],
    availability: {
      total: 2,
      available: 1,
      borrowed: 1
    },
    campusAvailability: [
      { campus: 'Campus Esslingen Flandernstraße', location: 'Medienausgabe, Schrank VR-2', available: 1, total: 1 },
      { campus: 'Campus Esslingen Stadtmitte', location: 'Geräteausgabe EG', available: 0, total: 1 },
      { campus: 'Campus Göppingen', location: 'Nicht verfügbar', available: 0, total: 0 }
    ],
    loanConditions: {
      loanPeriod: '7 Tage',
      extensions: 'Nach Verfügbarkeit',
      notes: 'Hochwertige Hardware - besondere Sorgfaltspflicht'
    }
  }
];

export const mockLoans: Loan[] = [
];
