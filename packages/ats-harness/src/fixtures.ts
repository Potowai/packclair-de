import type { CV } from '@cvclair/cv-schema';

/**
 * Jeu en or : 10 CV synthétiques représentatifs (PLAN §4.2).
 * Chaque gabarit est rendu avec chaque fixture en CI : lint 0 erreur,
 * précision d'extraction ≥ 98 %. Contenus conformes à la skill french-cv-style.
 */

const juniorDev: CV = {
  identite: {
    nomComplet: 'Léa Martin',
    titre: 'Développeuse front-end junior',
    email: 'lea.martin@example.fr',
    telephone: '06 12 34 56 78',
    localisation: 'Lyon'
  },
  accroche:
    'Développeuse front-end avec 2 ans d’expérience en React et TypeScript. J’ai livré 15 fonctionnalités en production pour une application utilisée par 40 000 utilisateurs.',
  experiences: [
    {
      id: 'exp-1',
      titre: 'Développeuse front-end',
      employeur: 'WebFactory',
      debut: '09/2023',
      fin: 'present',
      puces: [
        'Développer 15 fonctionnalités React en production, réduisant le temps de chargement de 30 %',
        'Mettre en place les tests Vitest, portant la couverture de 20 % à 75 %',
        'Corriger 60 anomalies remontées par le support en 6 mois'
      ]
    },
    {
      id: 'exp-2',
      titre: 'Développeuse web stagiaire',
      employeur: 'Studio Numérique',
      debut: '02/2023',
      fin: '08/2023',
      puces: ['Intégrer 8 maquettes Figma en HTML/CSS respectant les normes d’accessibilité']
    }
  ],
  formation: [
    {
      id: 'for-1',
      diplome: 'Master Informatique',
      etablissement: 'Université Claude Bernard Lyon 1',
      debut: '09/2021',
      fin: '06/2023'
    }
  ],
  competences: ['React', 'TypeScript', 'Vitest', 'Accessibilité', 'Git', 'CSS'],
  langues: [
    { langue: 'Français', niveau: 'MATERNELLE' },
    { langue: 'Anglais', niveau: 'B2' }
  ],
  certifications: [],
  centresInteret: []
};

const cadreCommercial: CV = {
  identite: {
    nomComplet: 'Karim Benali',
    titre: 'Directeur commercial B2B',
    email: 'karim.benali@example.fr',
    telephone: '06 23 45 67 89',
    localisation: 'Paris'
  },
  accroche:
    'Directeur commercial avec 12 ans d’expérience dans la vente de solutions SaaS. J’ai piloté une équipe de 14 commerciaux et dépassé les objectifs de 20 % pendant 3 années consécutives.',
  experiences: [
    {
      id: 'exp-1',
      titre: 'Directeur commercial',
      employeur: 'SalesPro',
      debut: '01/2020',
      fin: 'present',
      puces: [
        'Piloter une équipe de 14 commerciaux générant 8 M€ de chiffre d’affaires annuel',
        'Augmenter le taux de closing de 18 % à 27 % en repensant le processus de vente',
        'Signer 12 comptes stratégiques de plus de 200 k€ chacun'
      ]
    },
    {
      id: 'exp-2',
      titre: 'Ingénieur commercial grands comptes',
      employeur: 'CloudVentes',
      debut: '03/2014',
      fin: '12/2019',
      puces: [
        'Développer un portefeuille de 45 clients grands comptes dans le secteur bancaire',
        'Réaliser 120 % de l’objectif annuel pendant 4 exercices consécutifs'
      ]
    }
  ],
  formation: [
    { id: 'for-1', diplome: 'Master 2 Commerce et Vente', etablissement: 'IAE Paris-Sorbonne', fin: '06/2013' }
  ],
  competences: ['Négociation grands comptes', 'Management', 'Salesforce', 'Stratégie commerciale'],
  langues: [
    { langue: 'Français', niveau: 'MATERNELLE' },
    { langue: 'Anglais', niveau: 'C1' }
  ],
  certifications: ['Certification Miller Heiman Strategic Selling'],
  centresInteret: []
};

const reconversionInfirmiere: CV = {
  identite: {
    nomComplet: 'Sophie Dubois',
    titre: 'Infirmière diplômée d’État',
    email: 'sophie.dubois@example.fr',
    telephone: '06 34 56 78 90',
    localisation: 'Nantes'
  },
  accroche:
    'Infirmière diplômée d’État en reconversion après 8 ans dans la restauration collective. J’apporte rigueur, gestion du stress et sens du service validés par 3 stages hospitaliers.',
  experiences: [
    {
      id: 'exp-1',
      titre: 'Infirmière stagiaire',
      employeur: 'CHU de Nantes',
      debut: '01/2024',
      fin: '06/2024',
      puces: [
        'Assurer les soins de 12 patients par jour en médecine interne',
        'Administrer les traitements sous supervision avec 0 erreur sur 5 mois'
      ]
    },
    {
      id: 'exp-2',
      titre: 'Responsable de salle',
      employeur: 'RestoCollect',
      debut: '03/2015',
      fin: '08/2020',
      puces: [
        'Manager une équipe de 6 personnes servant 400 couverts par service',
        'Réduire le gaspillage alimentaire de 25 % en optimisant les commandes'
      ]
    }
  ],
  formation: [
    {
      id: 'for-1',
      diplome: 'Diplôme d’État d’infirmier',
      etablissement: 'IFSI de Nantes',
      debut: '09/2021',
      fin: '06/2024'
    }
  ],
  competences: ['Soins infirmiers', 'Dossier patient informatisé', 'Gestion du stress', 'Travail en équipe'],
  langues: [{ langue: 'Français', niveau: 'MATERNELLE' }],
  certifications: ['Attestation AFGSU 2'],
  centresInteret: []
};

const chefDeProjetBtp: CV = {
  identite: {
    nomComplet: 'Thomas Lefèvre',
    titre: 'Conducteur de travaux',
    email: 'thomas.lefevre@example.fr',
    telephone: '06 45 67 89 01',
    localisation: 'Bordeaux'
  },
  accroche:
    'Conducteur de travaux avec 7 ans d’expérience en construction de logements collectifs. J’ai livré 9 chantiers représentant 35 M€ de travaux, dans les délais et sans accident.',
  experiences: [
    {
      id: 'exp-1',
      titre: 'Conducteur de travaux',
      employeur: 'BâtiSud',
      debut: '04/2019',
      fin: 'present',
      puces: [
        'Conduire 5 chantiers de logements collectifs de 2 à 8 M€, livrés dans les délais',
        'Coordonner 15 entreprises sous-traitantes et 60 compagnons en phase gros œuvre',
        'Réduire les réserves à la réception de 40 % grâce à un suivi qualité hebdomadaire'
      ]
    }
  ],
  formation: [
    {
      id: 'for-1',
      diplome: 'DUT Génie civil',
      etablissement: 'IUT de Bordeaux',
      debut: '09/2014',
      fin: '06/2016'
    },
    {
      id: 'for-2',
      diplome: 'Licence professionnelle Conduite de travaux',
      etablissement: 'Conservatoire de Bordeaux',
      debut: '09/2016',
      fin: '06/2017'
    }
  ],
  competences: ['Conduite de travaux', 'Lecture de plans', 'AutoCAD', 'Gestion de budget', 'Sécurité chantier'],
  langues: [{ langue: 'Français', niveau: 'MATERNELLE' }],
  certifications: ['Habilitation électrique B2V'],
  centresInteret: []
};

const comptable: CV = {
  identite: {
    nomComplet: 'Nadia Haddad',
    titre: 'Comptable clients',
    email: 'nadia.haddad@example.fr',
    telephone: '06 56 78 90 12',
    localisation: 'Lille'
  },
  accroche:
    'Comptable clients avec 5 ans d’expérience en cabinet et en entreprise. J’ai réduit le délai de recouvrement de 12 jours et fiabilisé 1 500 comptes clients.',
  experiences: [
    {
      id: 'exp-1',
      titre: 'Comptable clients',
      employeur: 'DistribNord',
      debut: '09/2021',
      fin: 'present',
      puces: [
        'Gérer 1 500 comptes clients représentant 12 M€ d’encaissements annuels',
        'Réduire le délai moyen de paiement de 48 à 36 jours en structurant les relances',
        'Automatiser le lettrage de 80 % des écritures sous Sage'
      ]
    },
    {
      id: 'exp-2',
      titre: 'Assistante comptable',
      employeur: 'Cabinet Fidex',
      debut: '09/2019',
      fin: '08/2021',
      puces: ['Tenir la comptabilité de 25 dossiers TPE en supervision mensuelle']
    }
  ],
  formation: [
    { id: 'for-1', diplome: 'BTS Comptabilité et gestion', etablissement: 'Lycée Colbert de Lille', fin: '06/2019' }
  ],
  competences: ['Sage 100', 'Excel', 'Recouvrement', 'Lettrage de comptes', 'TVA'],
  langues: [
    { langue: 'Français', niveau: 'MATERNELLE' },
    { langue: 'Arabe', niveau: 'C1' }
  ],
  certifications: [],
  centresInteret: []
};

const dataAnalyst: CV = {
  identite: {
    nomComplet: 'Julien Moreau',
    titre: 'Data analyst',
    email: 'julien.moreau@example.fr',
    telephone: '06 67 89 01 23',
    localisation: 'Paris'
  },
  accroche:
    'Data analyst avec 4 ans d’expérience en e-commerce. J’ai construit les tableaux de bord suivis par 120 collaborateurs et identifié 1,2 M€ d’économies logistiques.',
  experiences: [
    {
      id: 'exp-1',
      titre: 'Data analyst',
      employeur: 'ShopLine',
      debut: '02/2022',
      fin: 'present',
      puces: [
        'Construire 25 tableaux de bord Power BI utilisés quotidiennement par 120 collaborateurs',
        'Identifier 1,2 M€ d’économies logistiques par l’analyse des taux de retour produit',
        'Automatiser 10 rapports hebdomadaires en Python, libérant 2 jours par mois'
      ]
    }
  ],
  formation: [
    {
      id: 'for-1',
      diplome: 'Master Statistique et informatique décisionnelle',
      etablissement: 'Université Paris-Dauphine',
      fin: '06/2021'
    }
  ],
  competences: ['SQL', 'Python', 'Power BI', 'dbt', 'Statistiques'],
  langues: [
    { langue: 'Français', niveau: 'MATERNELLE' },
    { langue: 'Anglais', niveau: 'C1' }
  ],
  certifications: ['PL-300 Microsoft Power BI Data Analyst'],
  centresInteret: []
};

const assistanteAdministrative: CV = {
  identite: {
    nomComplet: 'Marie Lambert',
    titre: 'Assistante administrative',
    email: 'marie.lambert@example.fr',
    telephone: '06 78 90 12 34',
    localisation: 'Toulouse'
  },
  accroche:
    'Assistante administrative avec 6 ans d’expérience dans le secteur public. J’assure le secrétariat d’une direction de 80 agents et la gestion de 200 dossiers par an.',
  experiences: [
    {
      id: 'exp-1',
      titre: 'Assistante administrative',
      employeur: 'Conseil départemental de Haute-Garonne',
      debut: '05/2020',
      fin: 'present',
      puces: [
        'Organiser 40 réunions de direction par an et en rédiger les comptes rendus',
        'Instruire 200 dossiers administratifs annuels avec un délai moyen de 5 jours',
        'Former 8 nouveaux agents aux outils bureautiques'
      ]
    }
  ],
  formation: [
    { id: 'for-1', diplome: 'BTS Assistant de gestion PME-PMI', etablissement: 'Lycée Saint-Sernin', fin: '06/2018' }
  ],
  competences: ['Pack Office', 'Rédaction administrative', 'Classement des dossiers', 'Accueil téléphonique'],
  langues: [
    { langue: 'Français', niveau: 'MATERNELLE' },
    { langue: 'Espagnol', niveau: 'B1' }
  ],
  certifications: [],
  centresInteret: []
};

const ingenieurQualite: CV = {
  identite: {
    nomComplet: 'Antoine Girard',
    titre: 'Ingénieur qualité fournisseurs',
    email: 'antoine.girard@example.fr',
    telephone: '06 89 01 23 45',
    localisation: 'Toulouse'
  },
  accroche:
    'Ingénieur qualité avec 8 ans d’expérience en aéronautique. J’ai fait passer le taux de non-conformité fournisseurs de 4,2 % à 1,1 % sur 30 références critiques.',
  experiences: [
    {
      id: 'exp-1',
      titre: 'Ingénieur qualité fournisseurs',
      employeur: 'AeroParts',
      debut: '10/2018',
      fin: 'present',
      puces: [
        'Auditer 20 fournisseurs par an selon la norme EN 9100',
        'Réduire le taux de non-conformité de 4,2 % à 1,1 % sur 30 références critiques',
        'Déployer 15 plans de progrès suivis mensuellement avec les fournisseurs'
      ]
    }
  ],
  formation: [
    {
      id: 'for-1',
      diplome: 'Diplôme d’ingénieur en génie industriel',
      etablissement: 'ENSMA Poitiers',
      fin: '09/2016'
    }
  ],
  competences: ['EN 9100', 'Audit fournisseurs', '8D', 'AMDEC', 'MSA'],
  langues: [
    { langue: 'Français', niveau: 'MATERNELLE' },
    { langue: 'Anglais', niveau: 'C1' }
  ],
  certifications: ['Auditeur interne EN 9100'],
  centresInteret: []
};

const etudianteStage: CV = {
  identite: {
    nomComplet: 'Chloé Petit',
    titre: 'Étudiante en BUT Marketing',
    email: 'chloe.petit@example.fr',
    telephone: '06 90 12 34 56',
    localisation: 'Rennes'
  },
  accroche:
    'Étudiante en deuxième année de BUT Techniques de commercialisation, à la recherche d’un stage de 10 semaines en marketing digital à partir d’avril.',
  experiences: [
    {
      id: 'exp-1',
      titre: 'Vendeuse à temps partiel',
      employeur: 'SportShop',
      debut: '06/2023',
      fin: 'present',
      puces: [
        'Conseiller 50 clients par jour et atteindre 110 % de l’objectif de ventes du rayon',
        'Animer le compte Instagram du magasin, gagnant 800 abonnés en 6 mois'
      ]
    }
  ],
  formation: [
    {
      id: 'for-1',
      diplome: 'BUT Techniques de commercialisation',
      etablissement: 'IUT de Rennes',
      debut: '09/2023',
      fin: '06/2026'
    }
  ],
  competences: ['Réseaux sociaux', 'Canva', 'Relation client', 'Vente'],
  langues: [
    { langue: 'Français', niveau: 'MATERNELLE' },
    { langue: 'Anglais', niveau: 'B1' }
  ],
  certifications: [],
  centresInteret: ['Course à pied — semi-marathon de Rennes 2025']
};

const responsableRH: CV = {
  identite: {
    nomComplet: 'Isabelle Roche',
    titre: 'Responsable ressources humaines',
    email: 'isabelle.roche@example.fr',
    telephone: '06 01 23 45 67',
    localisation: 'Strasbourg'
  },
  accroche:
    'Responsable RH avec 10 ans d’expérience en PME industrielle. J’ai divisé par deux le turnover et déployé la GPEC pour 250 collaborateurs sur 3 sites.',
  experiences: [
    {
      id: 'exp-1',
      titre: 'Responsable ressources humaines',
      employeur: 'MecaEst',
      debut: '09/2017',
      fin: 'present',
      puces: [
        'Réduire le turnover de 22 % à 11 % en repensant l’intégration et les entretiens annuels',
        'Déployer la GPEC pour 250 collaborateurs sur 3 sites de production',
        'Recruter 60 profils par an, dont 40 % de profils pénuriques, avec un délai moyen de 45 jours'
      ]
    }
  ],
  formation: [
    {
      id: 'for-1',
      diplome: 'Master 2 Gestion des ressources humaines',
      etablissement: 'EM Strasbourg',
      fin: '06/2015'
    }
  ],
  competences: ['Recrutement', 'GPEC', 'Droit du travail', 'SIRH', 'Formation'],
  langues: [
    { langue: 'Français', niveau: 'MATERNELLE' },
    { langue: 'Allemand', niveau: 'B2' }
  ],
  certifications: [],
  centresInteret: []
};

/** Les 10 fixtures en or, dans l'ordre du plan : junior, cadre, reconversion, secteurs variés. */
export const FIXTURES_OR: { id: string; cv: CV }[] = [
  { id: 'junior-dev', cv: juniorDev },
  { id: 'cadre-commercial', cv: cadreCommercial },
  { id: 'reconversion-infirmiere', cv: reconversionInfirmiere },
  { id: 'chef-de-projet-btp', cv: chefDeProjetBtp },
  { id: 'comptable', cv: comptable },
  { id: 'data-analyst', cv: dataAnalyst },
  { id: 'assistante-administrative', cv: assistanteAdministrative },
  { id: 'ingenieur-qualite', cv: ingenieurQualite },
  { id: 'etudiante-stage', cv: etudianteStage },
  { id: 'responsable-rh', cv: responsableRH }
];
