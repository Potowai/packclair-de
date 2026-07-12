# PackClair DE — Conception du produit

**Date :** 2026-07-12  
**Statut :** Finalisé pour planification ; l’utilisateur a explicitement délégué les décisions et demandé de continuer  
**Nom de travail :** PackClair DE ; le nom de production sera vérifié avant l’achat du domaine et le lancement public.

## 1. Décision

Créer une application web en français, privilégiant le traitement local, pour les petits vendeurs en ligne qui expédient des marchandises emballées en Allemagne. L’application utilise les exports de commandes et les poids d’emballage fournis par l’utilisateur pour préparer des totaux auditables. Après confirmation des volumes déjà déclarés à l’opérateur de système, elle produit un fichier XML LUCID au moyen d’un sérialiseur testé en intégration continue contre le schéma officiel allemand.

PackClair DE est un outil de calcul et de préparation de fichiers. Il n’inscrit pas un vendeur, ne signe pas de contrat de participation à un système, ne soumet pas de déclaration, ne qualifie pas la situation juridique d’un vendeur et ne certifie pas la conformité.

Le produit commence avec l’Allemagne uniquement, les imports CSV uniquement et sans IA générative. Ces contraintes rendent le résultat testable, peu coûteux à exploiter et utile sans téléverser l’historique des commandes d’un marchand sur un serveur.

## 2. Éléments probants et justification du marché

L’Office central allemand du registre des emballages indique que les entreprises de vente à distance et les détaillants en ligne qui expédient commercialement des marchandises à des clients en Allemagne doivent s’inscrire dans LUCID, même lorsque l’entreprise est établie à l’étranger et que le volume d’emballages est faible. Les emballages d’expédition sont presque toujours soumis à la participation à un système. Les vendeurs concernés doivent s’inscrire, conclure un contrat avec un opérateur de système et déclarer les mêmes volumes d’emballages à cet opérateur et à LUCID.

Sources :

- Obligations des détaillants en ligne en Allemagne : <https://www.verpackungsregister.org/en/knowledge-bases/mail-order-companies-and-online-retailers>
- Instructions officielles de téléversement XML, exemple et schéma : <https://www.verpackungsregister.org/en/registration/find-out-about-registrations/using-an-xml-interface-to-upload-your-data>
- Règles officielles sur l’identité des déclarations, les types et les dates limites : <https://www.verpackungsregister.org/en/system-participation-data-reporting/data-reporting>
- Guide officiel des types de déclarations, mis à jour en février 2025 : <https://www.verpackungsregister.org/fileadmin/files/Erklaermaterialien/Guideline_data_reporting.pdf>
- Date d’application du règlement de l’UE sur les emballages et les déchets d’emballages : <https://environment.ec.europa.eu/topics/waste-and-recycling/packaging-waste_en>
- Guide allemand relatif aux modifications du PPWR du 12 août 2026 concernant les marques propres et les importations : <https://www.verpackungsregister.org/en/ppwr/system-participation-own-brands-imports>

Le travail récurrent n’est pas l’inscription elle-même. Il consiste à tenir les poids à jour, rapprocher les commandes envoyées en Allemagne, agréger les totaux par type de matériau officiel, conserver une piste de calcul et préparer des déclarations cohérentes. Cela crée une raison annuelle ou périodique d’utiliser le produit.

Les tarifs publics des concurrents constituent un signal de budget, mais ne prouvent ni leurs ventes ni la volonté de payer pour PackClair DE. Instantané vérifié le 12 juillet 2026 :

- EPR Pack Report affiche USD 179 par an et se concentre sur Shopify : <https://apps.shopify.com/epr-pack-report>
- VerpackRegister affiche une offre centrée sur l’Allemagne à partir de EUR 14 par mois après la bêta : <https://verpackregister.de/preise>

PackClair DE sera au contraire centré d’abord sur le français, fonctionnera à partir d’exports CSV génériques, opérera localement, évitera l’OAuth des places de marché et ciblera les vendeurs dont le volume ne justifie pas une plateforme de conformité plus importante.

## 3. Client cible et tâche à accomplir

Le premier client est un professionnel établi en France : une microentreprise, un vendeur artisanal ou une petite entreprise de commerce électronique ayant environ 1 à 5 000 commandes à destination de l’Allemagne par an. Le vendeur utilise Etsy, Amazon, PrestaShop, WooCommerce, Shopify ou un tableur et peut exporter les lignes de commande au format CSV. Le paiement public n’accepte initialement que les clients professionnels français ; l’extension aux clients établis ailleurs ne fait pas partie de la première version.

La tâche du client est la suivante :

> « À partir des poids que j’ai mesurés ou reçus de fournisseurs, aidez-moi à calculer les matériaux d’emballage que j’ai mis sur le marché allemand, à expliquer chaque total et à créer le fichier que je peux examiner et téléverser moi-même. »

Le produit ne s’adresse pas aux grandes opérations de traitement des commandes, aux cabinets de conseil en conformité, à la classification réglementée de produits ni aux entreprises cherchant à être représentées auprès des autorités allemandes.

## 4. Objectifs, éléments hors périmètre et critères de réussite

### Objectifs

1. Transformer un CSV générique de lignes de commande en colonnes opérationnelles sélectionnées et minimisées concernant uniquement les expéditions vers l’Allemagne.
2. Permettre au vendeur de tenir à jour des profils d’emballages de vente et d’expédition par SKU et catégorie officielle de matériau.
3. Appliquer l’emballage d’expédition par colis ou expédition réelle, et l’emballage de vente par quantité d’articles.
4. Produire des totaux transparents en kilogrammes avec trois décimales.
5. Générer, à partir des volumes confirmés auprès de l’opérateur, un fichier XML avec BOM UTF-8 au moyen d’un sérialiseur testé contre la structure officielle LUCID, ainsi qu’un rapport d’audit lisible par l’humain.
6. Conserver les données de commande et les calculs sur l’appareil de l’utilisateur.
7. Vendre l’accès par un abonnement annuel unique avec une faculté contractuelle de résiliation en libre-service.
8. Maintenir un coût nominal inférieur à EUR 10 par mois avant 50 clients, et mesurer séparément le coût d’une exploitation résiliente incluant supervision externe et sauvegardes.

### Éléments hors périmètre de la première version

- Aucun conseil juridique ni certificat de conformité.
- Aucune inscription à LUCID ni soumission de déclaration pour le compte d’un utilisateur.
- Aucun achat de contrat de participation à un système ni comparaison de prix.
- Aucune déclaration de volumes supplémentaires ou de volumes déduits ; la première version ne prend en charge que les trois flux de déclarations complètes à valeurs non négatives.
- Aucune déclaration pour la France, l’Italie, l’Espagne, l’Autriche ou un autre pays.
- Aucune intégration OAuth avec Shopify, Etsy, Amazon ou PrestaShop.
- Aucune estimation automatique de la composition ou du poids des emballages.
- Aucun stockage de facture PDF, d’adresse client ou d’adresse e-mail.
- Aucun espace de travail multiutilisateur, tableau de bord pour comptable, API ou mode marque blanche.
- Aucun guide réglementaire généré par IA.

### Critères de réussite commerciale

- Trois clients payants dans les 60 jours suivant le lancement public.
- Avant d’engager plus de EUR 50 de dépenses de production, obtenir soit trois utilisateurs professionnels qualifiés ayant terminé le calculateur bêta, soit une précommande fondatrice remboursable.
- Sept clients actifs en équivalent annuel dans les six mois, correspondant à environ EUR 58 de revenus récurrents mensuels bruts à EUR 99 par an.
- Vingt-cinq clients actifs en équivalent annuel comme premier objectif ambitieux, correspondant à environ EUR 206 de revenus récurrents mensuels bruts.
- Moins d’une heure d’assistance par mois après les dix premiers clients.
- Moins de douze heures annuelles de maintenance, support et revue réglementaire après stabilisation.
- Aucun fichier XML diffusé avec une erreur de schéma connue.
- Aucun litige de paiement sur les cinquante premières transactions ; ensuite, taux glissant inférieur à 2 %.

Les chiffres d’affaires sont indiqués avant les frais Stripe, les cotisations sociales françaises et les taxes. Un prix concurrent affiché ne vaut pas validation du marché : la bêta gratuite et la précommande constituent les portes de validation commerciale.

## 5. Offre et tarification

### Produit gratuit

- Orientation en langage clair sur l’éligibilité, avec des liens vers les sources officielles et sans conclusion juridique.
- Un calcul manuel d’emballage avec les catégories officielles de matériaux.
- Un modèle CSV d’exemple et un rapport d’exemple.
- Un aperçu XML en lecture seule créé à partir de données d’exemple.

L’outil gratuit est utile sans créer de compte. Il constitue également le principal levier d’acquisition par la recherche.

### Produit Pro

- Nombre illimité de SKU locaux, profils d’emballage, imports de commandes et déclarations.
- Assistant générique de correspondance des colonnes CSV avec préréglages locaux réutilisables.
- Filtrage sur l’Allemagne, détection des doublons, rapprochement et flux de traitement des profils manquants.
- Téléchargement du XML LUCID, CSV récapitulatif des matériaux et rapport de piste de calcul.
- Historique local, jeton d’accès signé, sauvegarde JSON et restauration.
- Mises à jour du format réglementaire pendant que l’abonnement est actif.
- Portail de facturation en libre-service et récupération par lien magique envoyé par e-mail.

Prix : une offre annuelle récurrente à EUR 99 avant toute taxe légalement applicable. Le paiement et les factures utilisent la configuration fiscale réelle du propriétaire de la microentreprise. Il n’existe aucune offre mensuelle dans la première version.

## 6. Parcours utilisateur principaux

### 6.1 Découverte et achat

1. Un visiteur arrive sur un guide en français ou sur le calculateur gratuit.
2. Le visiteur essaie un petit calcul à partir de données d’exemple ou saisies manuellement.
3. L’orientation, datée de sa dernière revue, distingue les règles antérieures et postérieures au 12 août 2026 pour les marques propres et importations, renvoie vers la source officielle et ne conclut jamais à la place du vendeur.
4. Le produit explique que le calcul, l’inscription, la participation à un système, la déclaration préalable à l’opérateur et le dépôt dans LUCID sont des responsabilités distinctes.
5. Avant la redirection, le navigateur crée un nonce PKCE ; son empreinte est liée aux métadonnées de la session Stripe et la redirection de retour appartient à une liste fermée.
6. Le visiteur choisit Pro et paie sur Stripe Checkout.
7. Après confirmation du paiement par le webhook, le navigateur échange une seule fois le vérificateur PKCE contre un jeton d’accès signé ne contenant ni adresse e-mail ni donnée personnelle.
8. Stripe Customer Portal gère les mises à jour de carte, les factures, la résiliation et le renouvellement.

### 6.2 Premier calcul

1. À partir d’une date fiable fournie par le serveur en heure allemande, l’utilisateur sélectionne uniquement une combinaison type/année/période actuellement disponible : `HPM1` pour l’année suivante jusqu’au 31 décembre, `HMM1` pour une période de l’année courante, ou `HJM1` pour l’année précédente jusqu’au 15 mai. Après le 15 mai, PackClair signale que le rapport supplémentaire `HNM1` requis n’est pas pris en charge.
2. L’utilisateur choisit exactement un opérateur de système. Les vendeurs utilisant plusieurs opérateurs sont hors du périmètre de la première version.
3. L’utilisateur crée des profils versionnés de produit et d’expédition, par exemple « petit colis en carton », avec les poids par matériau.
4. L’utilisateur importe un CSV et identifie la source et le compte boutique, puis associe l’identifiant de commande, la date métier, le pays de destination, le SKU, la quantité et, facultativement, l’identifiant de ligne, l’identifiant d’expédition, le nombre de colis et le profil d’expédition.
5. L’outil d’import affiche les colonnes qui seront conservées. Ce sont des colonnes opérationnelles susceptibles de contenir des identifiants indirects ; les noms, adresses postales, adresses e-mail, numéros de téléphone et toutes les colonnes non associées sont supprimés et ne sont jamais persistés.
6. Les valeurs de pays telles que `DE`, `Germany`, `Deutschland` et `Allemagne` sont normalisées en Allemagne. Les destinations ambiguës ou manquantes nécessitent un examen.
7. L’application regroupe par clé composite source/compte/commande/expédition. L’emballage d’expédition est compté par colis réel et l’emballage de vente selon la quantité de chaque SKU. Sans identifiant d’expédition ni nombre de colis, l’utilisateur doit confirmer que chaque commande du lot correspond exactement à un colis ; sinon l’export reste bloqué.
8. Les profils manquants, quantités invalides, recouvrements de lots, lignes en double et données d’expédition inconnues sont présentés comme des éléments de rapprochement bloquants.
9. L’utilisateur examine les volumes calculés, les lignes exclues, les conventions d’arrondi, les versions de profils et les lots sources.
10. Le calcul sert à préparer la déclaration auprès de l’opérateur. L’utilisateur confirme ensuite, matériau par matériau, les masses, la période et l’opérateur qu’il a effectivement déclarés ou fait confirmer à cet opérateur.
11. Le XML prend exclusivement ces valeurs confirmées comme source. Tout écart avec les valeurs calculées est visible et exige un motif local ; l’utilisateur confirme que le XML sera transmis à LUCID avec des valeurs identiques à celles de l’opérateur.
12. Après vérification en ligne de la fraîcheur du jeu de référence, l’utilisateur télécharge le XML, le CSV récapitulatif et un rapport d’audit, puis soumet lui-même le XML dans LUCID.
13. L’utilisateur exporte une sauvegarde locale immédiatement après la première déclaration réussie.

### 6.3 Utilisateur récurrent

1. L’utilisateur restaure automatiquement l’état local de l’application depuis IndexedDB.
2. Un lot nouvellement importé est comparé par empreinte et par clés composites source/compte/commande/ligne afin de détecter les réimports et recouvrements partiels.
3. Sans identifiant de ligne stable, l’ajout n’est autorisé que pour des périodes strictement disjointes ; sinon l’utilisateur doit remplacer un lot complet ou annuler.
4. Toute modification d’un profil crée une nouvelle révision immuable. Les anciens rapports conservent un instantané des poids utilisés.

## 7. Modèle de calcul

### Codes de matériaux officiels pour les déclarations à partir de 2019

| Matériau | Code LUCID |
|---|---:|
| Verre | 10000 |
| Papier, carton plat, carton (PPC) | 20000 |
| Métaux ferreux | 30000 |
| Aluminium | 40000 |
| Plastiques | 50000 |
| Emballages en carton pour boissons | 60000 |
| Autres emballages composites | 70000 |
| Autres matériaux | 80000 |

L’application ne proposera pas les anciens codes VerpackV `39000`, `49000` ou `79000` pour les déclarations modernes, même si le XSD continue de les énumérer.

### Types de déclarations

| Déclaration | Code | Sémantique affichée par le produit |
|---|---|---|
| Volume prévisionnel initial | HPM1 | Déclaration complète |
| Volume en cours d’année | HMM1 | Déclaration complète |
| Volume de fin d’année | HJM1 | Déclaration complète |

Disponibilité officielle appliquée par le produit :

- `HPM1` concerne l’année civile suivante et n’est exportable que jusqu’au 31 décembre de l’année courante ; ensuite, la prévision de l’année courante utilise `HMM1`.
- `HMM1` concerne une période convenue avec l’opérateur dans l’année courante.
- `HJM1` concerne les volumes réels de l’année précédente et n’est exportable que jusqu’au 15 mai de l’année courante.

Le schéma officiel définit également des déclarations supplémentaires (`HNM1`) et de volumes déduits (`HAM1`). Elles ne sont délibérément pas prises en charge, car elles nécessitent un flux d’ajustement et peuvent comporter des valeurs négatives. À partir du 16 mai, PackClair explique qu’il ne peut pas préparer la correction ou déclaration tardive qui exige `HNM1`. L’interface ne choisit jamais un type à la place de l’utilisateur.

### Précision des poids

- Un profil de produit contient uniquement les composants d’emballage que l’utilisateur a décidé d’inclure dans le périmètre de déclaration. PackClair DE consigne cette décision, mais ne qualifie pas la responsabilité juridique concernant les emballages de vente, groupés, d’importation ou d’expédition.
- Les utilisateurs saisissent les poids des composants en grammes avec jusqu’à trois décimales.
- Le modèle de domaine stocke des milligrammes en `bigint` et n’utilise jamais d’arithmétique binaire à virgule flottante pour les totaux.
- Tous les composants de produit et d’expédition applicables sont additionnés en milligrammes.
- Le calcul préparatoire arrondit au gramme le plus proche, les demi-unités étant arrondies vers le haut. Il s’agit d’une convention PackClair, pas d’une règle d’arrondi imposée par le XSD.
- Le XML utilise les masses exactes en kilogrammes à trois décimales que l’utilisateur confirme avoir déclarées à l’opérateur. Le rapport d’audit présente le calcul avant arrondi, la suggestion PackClair, la valeur confirmée et l’écart motivé.
- Chaque calcul fige les révisions complètes des profils utilisés, les identifiants de lots, les exclusions, la version du moteur, le jeu de référence et la date fiable de génération afin de rester reproductible.

### Règles relatives aux commandes

- L’emballage de vente est multiplié par la quantité d’articles.
- L’emballage d’expédition est appliqué à chaque identifiant d’expédition ou nombre de colis réel, et non simplement à chaque commande.
- Plusieurs commandes peuvent partager une expédition et une commande peut comporter plusieurs colis ; la clé composite de l’expédition l’exprime explicitement.
- Sans donnée de colis, le lot est limité au cas confirmé « une commande égale exactement un colis ».
- Si la source ne comporte pas d’identifiant de ligne, les lignes reçoivent des clés locales au lot et l’utilisateur ne peut remplacer que le lot d’import complet, ce qui évite des hypothèses risquées de fusion ligne par ligne.
- Les retours, annulations, statuts de traitement et ajustements juridiques ne sont pas déduits. L’outil d’import peut associer une colonne de statut et permettre à l’utilisateur d’inclure ou d’exclure explicitement des valeurs avant l’import.
- Limites de sécurité de la première version : fichier de 25 Mio au maximum, 100 000 lignes, quantité entière de 1 à 1 000 000 par ligne et poids de composant de 0 à 100 kg. Les limites sont contrôlées avant toute multiplication.

## 8. Contrat XML

Le XML généré par le sérialiseur testé en intégration continue suit la structure officielle de déclaration des volumes des producteurs :

- Version d’interface `1.0`.
- Type d’emballage `V`.
- L’un des trois codes de déclarations complètes pris en charge.
- Un mois de début et un mois de fin appartenant à la même année civile ; la sérialisation utilise le premier jour du mois de début et le dernier jour du mois de fin.
- Exactement un identifiant d’opérateur de système issu du jeu de référence officiel figé.
- Des codes de matériaux modernes uniques avec des masses non nulles.
- Une masse formatée avec une virgule et trois décimales.
- UTF-8 avec une marque d’ordre des octets.
- Uniquement les champs structurels requis par le schéma officiel ; aucune donnée de commande client n’est incluse.

Les masses XML proviennent uniquement du rapport que l’utilisateur confirme avoir transmis à l’opérateur de système ; les calculs de commandes sont une aide au rapprochement. Le navigateur utilise des constructeurs typés au lieu de concaténer du XML contrôlé par l’utilisateur. Les octets effectivement proposés au téléchargement sont testés contre une copie figée du XSD officiel par un validateur indépendant en intégration continue. La formulation du produit est « généré par un sérialiseur testé contre le schéma publié », et non « validé individuellement » ni « acceptation garantie », car LUCID effectue aussi des contrôles de calendrier, de statut d’inscription et de plausibilité hors XSD.

L’export XML exige un jeu de référence vérifié depuis moins de huit jours et une combinaison type/année/date disponible. Cette vérification réseau n’envoie aucune donnée métier ; si elle échoue ou si le référentiel est périmé, les calculs et rapports d’audit restent utilisables hors ligne mais le téléchargement XML est bloqué.

## 9. Architecture

### 9.1 Application dans le navigateur

- Application web progressive en TypeScript et React, produite sous forme de ressources statiques et hébergée sur Cloudflare Pages.
- Installable et utilisable hors ligne après le premier chargement réussi.
- Moteur de domaine pur isolé dans un Web Worker sans API réseau pour la normalisation CSV, le rapprochement, l’agrégation en `bigint`, la construction des déclarations et la sérialisation XML.
- IndexedDB pour les produits locaux, les révisions immuables de profils, les lignes de commande normalisées, les expéditions, les métadonnées d’import, les instantanés de déclarations et les paramètres.
- Sauvegarde et restauration JSON avec versionnement explicite du schéma et tests de migration.
- Les sauvegardes sont étiquetées comme fichiers de données d’entreprise, car elles contiennent des identifiants de commande, des SKU et des poids d’emballage ; il est demandé aux utilisateurs de les stocker de manière sécurisée.
- L’application demande le stockage persistant du navigateur, affiche le quota et l’état d’éligibilité, rend chaque import atomique et propose une sauvegarde immédiate. En navigation privée ou sans persistance garantie, un avertissement bloque la création d’un historique durable.
- Aucun outil d’analyse tiers, widget de discussion, script publicitaire ou formulaire de paiement intégré sur l’origine de l’application.

### 9.2 Serveur minimal

Un Cloudflare Worker et une base de données D1 relevant d’une juridiction de l’UE gèrent uniquement les opérations commerciales :

- Création de Stripe Checkout Session.
- Échange PKCE à usage unique après Stripe Checkout.
- Webhooks Stripe idempotents et rapprochement avec l’état autoritatif de l’abonnement chez Stripe.
- Droit d’accès lié à l’abonnement et expiration.
- Jetons d’accès hors ligne signés.
- Récupération sans mot de passe par lien magique.
- Limitation de débit et protection Turnstile pour les points de terminaison d’e-mail.
- E-mails transactionnels par l’intermédiaire de Resend.
- Surveillance hebdomadaire du XSD, du guide XML et du guide officiel des types et dates de déclaration.
- Date fiable en heure allemande et statut de fraîcheur du jeu de référence.

Aucune commande, aucun SKU, poids d’emballage, calcul, rapport ou nom de fichier importé n’est transmis au serveur.

### 9.3 Droits d’accès et comportement hors ligne

- Le Worker signe les jetons d’accès ; le paquet destiné au navigateur contient uniquement la clé publique de vérification.
- Un jeton Pro est valide hors ligne pendant 30 jours et contient `referenceSetVersion` et `xmlExportFreshUntil`. Le calcul reste hors ligne, mais l’XML exige une vérification réseau au plus tard huit jours après le dernier contrôle officiel réussi.
- La résiliation ne révoque pas l’accès prépayé avant la fin de la période de facturation.
- Un délai de grâce de récupération de sept jours couvre les indisponibilités temporaires de l’e-mail, de Stripe ou du Worker après l’expiration d’un jeton.
- Le calculateur gratuit reste disponible pendant toutes les indisponibilités du système de licences.

### 9.4 Données côté serveur

La base de données D1 stocke :

- L’identifiant client, l’adresse e-mail normalisée, l’identifiant client Stripe et les horodatages. Il s’agit de données de compte distinctes des imports de commandes locaux.
- L’identifiant d’abonnement, l’offre, le statut, la fin de la période en cours et la version du droit d’accès.
- Les jetons de liens magiques hachés, avec leur expiration et leur statut d’utilisation unique.
- Les identifiants des webhooks Stripe traités afin d’assurer l’idempotence.
- Les URL des sources officielles, les dernières empreintes connues, les dernières vérifications, la version du jeu de référence et le statut d’examen.

Les liens magiques expirent après quinze minutes et leurs traces techniques sont supprimées sous 24 heures. Les événements Stripe minimisés sont conservés 90 jours dans D1 pour l’idempotence, puis agrégés ou supprimés. Les données de compte sont conservées pendant le contrat puis 90 jours pour récupération, sauf demande d’effacement compatible avec les obligations applicables.

La suppression du compte efface les données opérationnelles D1 selon ces durées. Elle ne supprime pas les factures et pièces comptables que la microentreprise doit conserver dix ans ; ces pièces sont archivées séparément de D1 selon <https://www.economie.gouv.fr/entreprises/gerer-son-entreprise-au-quotidien/gerer-sa-comptabilite-et-ses-demarches/mentions-obligatoires-dune-facture-tout-savoir>. Stripe est un sous-traitant de paiement et ne remplace pas la responsabilité d’archivage du vendeur.

## 10. Surveillance des modifications des sources

Une tâche hebdomadaire récupère le XSD, le guide XML et le guide de déclaration officiels, puis compare leurs empreintes cryptographiques au jeu de référence figé de la version publiée. Le jeu contient le schéma, les règles de calendrier, les codes pris en charge, les matériaux modernes et les identifiants des opérateurs.

- Aucun changement : enregistrer une vérification d’état réussie.
- Échec réseau : réessayer avec temporisation exponentielle et n’émettre une alerte qu’après trois échecs consécutifs.
- Changement d’empreinte : marquer l’export XML comme `review required`, avertir le propriétaire, conserver les fonctionnalités de calcul et de sauvegarde, et empêcher le produit de revendiquer une validation par rapport au nouveau jeu de référence tant que le schéma, les codes et la liste des opérateurs n’ont pas été examinés et que les jeux de test ne sont pas concluants.
- Référence non vérifiée depuis huit jours : désactiver automatiquement tout nouvel export XML, même si aucune différence n’a été observée.
- Modification purement éditoriale d’un PDF : conserver l’alerte d’empreinte brute, mais comparer aussi l’extraction structurée des règles, codes et opérateurs pour accélérer la revue sans masquer le changement.
- Une supervision synthétique externe vérifie le Worker et le moniteur ; un composant ne peut pas être son propre unique témoin de panne.

Il s’agit de la principale tâche de maintenance exceptionnelle. Elle devrait se présenter rarement, mais ne peut pas être traitée de manière autonome et sûre lorsqu’une autorité de réglementation modifie un contrat lisible par machine.

## 11. Gestion des erreurs

### Erreurs CSV

- Détecter UTF-8 avec ou sans BOM, UTF-16LE/BE et Windows-1252 ; tout encodage incertain exige un choix explicite et un aperçu avant persistance.
- Le préréglage définit explicitement le format de date. Les formats ambigus comme `01/02/2026` sont rejetés sans ce choix. Les dates sont stockées comme dates métier sans fuseau et l’aperçu montre leur normalisation.
- Les identifiants de source, compte, commande, ligne, expédition et SKU restent des chaînes ; aucune coercition numérique ne retire les zéros initiaux.
- Détecter les délimiteurs français courants et les conventions décimales.
- Afficher un aperçu de dix lignes avant la persistance.
- Rejeter les correspondances obligatoires manquantes, les quantités inférieures à un ou non entières, les limites de taille dépassées, les identifiants de commande vides et les dates impossibles ou ambiguës.
- Conserver le fichier d’origine uniquement dans la mémoire du navigateur pendant l’analyse et le libérer après la normalisation.
- Signaler les erreurs au niveau des lignes avec des diagnostics exportables ; ne jamais ignorer silencieusement une ligne associée invalide.
- Neutraliser dans tout CSV exporté les cellules commençant par `=`, `+`, `-`, `@`, tabulation ou retour chariot afin d’empêcher l’injection de formules dans un tableur.

### Erreurs de rapprochement

- Les profils de SKU manquants, les expéditions contradictoires, les recouvrements partiels de commandes, les clés stables en double, les destinations inconnues et les statuts non pris en charge bloquent l’export final.
- Les utilisateurs ne peuvent exclure une ligne qu’au moyen d’une action explicite et examinée, consignée dans la piste d’audit locale.
- La réimportation d’un fichier ayant la même empreinte avertit l’utilisateur avant toute modification des données.
- Un ajout sans identifiant de ligne stable est refusé lorsque sa période recouvre un lot existant ; seul un remplacement complet est alors possible.

### Erreurs XML

- Les fenêtres temporelles indisponibles, les périodes invalides, les codes non pris en charge, un opérateur manquant ou inconnu, une absence de confirmation opérateur, un écart non motivé, les totaux négatifs et les valeurs qui dépassent les limites du schéma bloquent la sérialisation.
- Les éléments de matériaux dont la masse est nulle sont omis.
- Les fichiers générés utilisent des noms de fichiers compatibles ASCII et ne contiennent aucun texte libre fourni par le marchand.
- Un jeu de référence officiel modifié, périmé ou non examiné désactive le téléchargement XML tout en laissant disponibles les exports de calcul.

### Erreurs de stockage local

- Les migrations de base de données et les imports sont transactionnels et conservent la version locale précédente jusqu’à leur réussite.
- Les erreurs de quota et d’éviction sont expliquées ; une sauvegarde est proposée immédiatement après le premier import, après chaque déclaration et tous les 90 jours.
- Le produit indique clairement que la récupération des données de commande côté serveur est impossible par conception.

### Erreurs de paiement et d’e-mail

- Le traitement des webhooks Stripe est idempotent et peut être retenté sans risque.
- La réussite du paiement n’est pas considérée comme un paiement effectif tant que le webhook signé n’a pas été traité.
- Chaque événement pertinent relit l’abonnement autoritatif chez Stripe ou applique une version monotone, empêchant un événement ancien d’écraser un état récent. Les impayés suspendent le renouvellement du droit après la période prépayée ; un remboursement total ou un litige gagné par le client révoque le droit correspondant après rapprochement.
- L’échange post-Checkout exige le nonce PKCE à usage unique lié à la session ; un simple identifiant de session présent dans l’URL ne délivre jamais de jeton.
- Les liens magiques sont à usage unique, de courte durée, hachés au repos et soumis à une limitation de débit.
- Les e-mails transactionnels ne contiennent aucune donnée de commande ou d’emballage.

## 12. Confidentialité et sécurité

- Les fichiers de commandes ne quittent jamais le navigateur.
- Seules les colonnes opérationnelles explicitement associées sont persistées. Elles peuvent contenir des identifiants indirects ; l’interface avertit l’utilisateur, minimise les champs et lui permet de les supprimer localement.
- Les noms des clients, adresses postales, numéros de téléphone et adresses e-mail provenant des exports de places de marché sont supprimés.
- Politique de sécurité du contenu stricte ; aucun `unsafe-eval` ; aucun script d’application distant.
- Les informations de paiement sont recueillies uniquement par la page Checkout hébergée par Stripe.
- L’origine de l’application est distincte de l’origine marketing si des outils d’analyse marketing sont ajoutés ultérieurement.
- Le site marketing n’utilise initialement aucun cookie nécessitant un consentement.
- Les secrets du serveur existent uniquement dans les liaisons du Worker et ne sont jamais inclus dans le paquet destiné au navigateur.
- Les points de terminaison des licences et des liens magiques sont soumis à une limitation de débit, vérifient l’origine et sont protégés contre les attaques par rejeu.
- Les utilisateurs peuvent exporter leurs données locales, effacer la base de données locale, récupérer l’accès à la facturation et demander la suppression des données de compte côté serveur.

Les pages juridiques doivent inclure l’identité de l’éditeur, l’hébergeur, les conditions de vente, la politique de confidentialité, les sous-traitants, les durées de conservation, les règles de remboursement, les limites du produit et la faculté contractuelle de résiliation en ligne offerte par le portail. PackClair DE ne présentera pas cette faculté comme une obligation légale générale aux contrats B2B sans validation juridique. Il n’utilisera aucun sceau, badge ou formulation laissant entendre une approbation par LUCID, la ZSVR, le gouvernement allemand ou l’Union européenne.

## 13. Tests et critères de publication

### Tests du domaine

- Emballage d’expédition compté par colis pour une commande mono-colis, multi-colis, une expédition regroupant plusieurs commandes et un lot explicitement attesté mono-colis.
- Emballage de vente multiplié exactement par la quantité.
- Normalisation de l’Allemagne et exclusion explicite des pays ambigus.
- Clés composites multi-boutiques, imports en double, recouvrements partiels, périodes disjointes et remplacement de lot.
- Révisions immuables des profils et reproduction bit à bit d’un ancien instantané après modification des poids courants.
- Agrégation `bigint`, limites arithmétiques, convention d’arrondi PackClair et rapprochement avec les masses confirmées par l’opérateur.
- Matrice `HPM1`/`HMM1`/`HJM1` autour du 31 décembre et du 15/16 mai, selon une date serveur en heure allemande.
- Tests basés sur les propriétés prouvant l’indépendance par rapport à l’ordre des lignes et l’associativité de l’agrégation.

### Tests CSV

- Jeux de test assainis pour la virgule, le point-virgule, la tabulation, UTF-8, UTF-16LE/BE, Windows-1252, les décimales françaises, les formats de date explicites et les sauts de ligne entre guillemets.
- Correspondances génériques représentant des exports de type Etsy, Amazon, PrestaShop, WooCommerce et Shopify sans revendiquer d’intégration officielle.
- Tests par données aléatoires pour les lignes mal formées, champs surdimensionnés, quantités extrêmes et cellules d’injection de formule.
- Assertion automatisée vérifiant que les colonnes non associées n’entrent pas dans IndexedDB et que les exports neutralisent les formules.

### Tests XML

- Sortie de référence correspondant à la structure de l’exemple officiel.
- Chaque code de matériau moderne et chaque code de déclaration pris en charge.
- Chaque opérateur de système figé et rejet des opérateurs manquants, inconnus ou multiples.
- BOM UTF-8, virgules décimales, trois décimales, limites de dates valides et omission des zéros.
- Validation indépendante des octets réellement téléchargés par rapport au XSD officiel figé dans l’intégration continue.
- Tests négatifs pour chaque condition de blocage au niveau du schéma et du produit.

### Tests de l’application

- Calcul gratuit, retour d’achat, import, correspondance, rapprochement, téléchargement de déclaration, sauvegarde, restauration, effacement et récupération de licence de bout en bout.
- Lancement hors ligne et calcul avec un droit d’accès valide.
- Test réseau du Web Worker vérifiant qu’aucune requête ne contient, ne dépend ni ne dérive des données importées ; les requêtes séparées de licence, service worker et fraîcheur du référentiel restent autorisées sans données métier.
- Contrôles d’accessibilité, parcours au clavier, mise en page mobile et régression visuelle pour la page d’accueil et l’assistant principal.
- Matrice Chrome, Firefox, Safari et Edge couvrant mise à jour du service worker, migration N→N+1, cache périmé, quota faible et restauration d’une ancienne sauvegarde.

### Tests du serveur

- Signature des webhooks Stripe, rejeu, désordre, nouvelle tentative, rapprochement autoritatif, résiliation, impayé, renouvellement, remboursement et litige.
- Nonce PKCE, échange unique, redirections autorisées et absence de donnée personnelle dans le jeton.
- Expiration et usage unique des liens magiques.
- Vérification des droits d’accès signés et des délais de grâce hors ligne.
- États de réussite, d’échec transitoire, de péremption à huit jours, de changement éditorial et de modification structurée pour l’ensemble du jeu de référence.
- Sauvegarde D1, migration réversible et rapprochement périodique D1/Stripe avec test de restauration.

### Critères de publication

- Tous les tests automatisés réussissent à partir d’une extraction propre.
- La version de production ne présente aucune vulnérabilité de dépendance de gravité élevée.
- Les octets des jeux de test générés sont validés par un outil indépendant contre le XSD officiel actuel.
- Le test réseau de confidentialité ne révèle aucune transmission de donnée importée ou calculée.
- L’achat, le renouvellement, la résiliation et la récupération en mode test Stripe réussissent de bout en bout.
- Le contenu public ne contient aucune allégation de conformité ou de certification non étayée.

Le téléversement LUCID réussi d’un véritable marchand est souhaitable pendant la bêta, mais ne peut pas être fabriqué. Tant que cette preuve n’existe pas, la formulation publique reste limitée au sérialiseur testé contre le schéma et à la préparation des fichiers.

## 14. Conception de l’acquisition

Le lancement repose sur un trafic de recherche français à forte intention et sur un outil gratuit utile, plutôt que sur une prospection à froid automatisée.

Le parcours bêta mesure séparément : arrivée sur la page, calcul gratuit terminé, demande d’accès professionnel et précommande. Le paiement récurrent de production ne sera activé qu’après le signal de validation défini dans les critères de réussite. Les tarifs concurrents restent une hypothèse de prix, pas une preuve de conversion.

Pages initiales :

1. « LUCID Allemagne pour vendeur français » — obligations, liens officiels et limites du périmètre.
2. « Calculateur de poids d’emballages LUCID » — le calculateur interactif gratuit.
3. « Déclaration d’emballages Allemagne pour Etsy et petites boutiques » — flux CSV et exemple.
4. « Créer un XML LUCID » — explication du format officiel et exemple téléchargeable.

Chaque page contient des calculs, des exemples ou une interaction originaux. Le produit ne créera pas des centaines de pages de référencement programmatique interchangeables.

L’application peut rédiger des publications de lancement et des descriptions pour des annuaires, mais publier depuis un compte personnel ou contacter des tiers reste une action externe explicite au moment du lancement. Par défaut, le produit n’envoie pas de messages non sollicités.

## 15. Exploitation et automatisation

- Cloudflare déploie depuis le dépôt Git après la réussite des tests.
- Vérification hebdomadaire du jeu officiel complet : XSD, guide XML, guide des déclarations, calendrier, codes et opérateurs.
- Vérification quotidienne externe de l’état du Worker, du moniteur et des webhooks ; le mode sûr s’active après huit jours sans référence fraîche.
- Nouvelles tentatives Stripe automatiques et portail client en libre-service.
- Récupération automatique par lien magique et flux de suppression de compte.
- Alerte transactionnelle au propriétaire uniquement en cas de défaillances répétées de l’infrastructure, de modifications du schéma, de litiges de paiement ou d’augmentation du taux d’erreur.
- E-mail mensuel au propriétaire indiquant les clients, l’équivalent MRR, l’attrition, les remboursements, les litiges, les erreurs des points de terminaison et l’utilisation de l’infrastructure. Il ne peut pas inclure le nombre de calculs ou d’exports locaux.
- Sauvegarde chiffrée quotidienne de D1, migrations versionnées et réversibles, rapprochement mensuel avec Stripe et exercice de restauration trimestriel.
- Plafonds budgétaires avec alerte à EUR 10 et validation explicite avant de dépasser EUR 20 de coûts mensuels récurrents.
- Un centre d’aide statique, des fichiers d’exemple, des explications des codes d’erreur et une récupération guidée réduisent au minimum l’assistance.

L’objectif est un fonctionnement sans intervention à plus de 95 %, et non une fausse promesse d’absence totale de maintenance. Les modifications du format réglementaire, les litiges de paiement, les incidents de sécurité et les questions inhabituelles des clients nécessitent un jugement humain.

## 16. Enveloppe de coûts

Coût nominal initial attendu pour l’infrastructure :

- Cloudflare Pages, Workers, D1 et Turnstile : gratuits dans les limites des quotas de démarrage ; l’offre Workers payante commence aux environs de USD 5 par mois si nécessaire.
- Resend : gratuit dans la limite de 3,000 e-mails transactionnels par mois et 100 par jour.
- Stripe : frais standard français pour les cartes de l’EEE, auxquels s’ajoute le pourcentage de Stripe Billing ; aucun frais mensuel fixe de plateforme avec la tarification à l’usage.
- Domaine : environ EUR 10–20 par an selon le bureau d’enregistrement et le nom choisis.
- Aucun coût d’inférence de modèle ou de génération de médias.

Enveloppe résiliente, supervision externe et sauvegardes comprises : EUR 10 à 20 par mois une fois le paiement activé. Aux tarifs Stripe consultés le 12 juillet 2026, la contribution approximative d’un abonnement annuel à EUR 99 payé par carte EEE est de EUR 96,57 avant cotisations et impôts. Les coûts fixes résilients de EUR 120 à 240 par an demandent donc environ deux à trois clients pour être couverts hors temps du propriétaire. En valorisant douze heures annuelles à EUR 30, le seuil économique complet se situe autour de six clients.

Supabase n’est pas requis pour la première version. Le compte Supabase dont dispose l’utilisateur reste une option si une future synchronisation cloud multiutilisateur génère suffisamment de revenus pour justifier une offre de base de données de production.

## 17. Séquence de livraison

1. Créer le paquet de domaine pur de calcul et de XML avec les jeux de test officiels.
2. Créer la PWA locale, le calculateur gratuit, l’outil de correspondance CSV, le rapprochement, la sauvegarde et les déclarations.
3. Ajouter le Worker minimal, le schéma D1, les liens magiques, les droits d’accès signés et la facturation Stripe en mode test.
4. Créer les pages d’acquisition en français, l’orientation PPWR datée, les pages juridiques, la documentation et les fichiers d’exemple, puis relire les affirmations contre les sources officielles en vigueur.
5. Effectuer les vérifications fonctionnelles, de confidentialité, d’accessibilité, de sécurité et visuelles.
6. Déployer le calculateur bêta et mesurer le signal commercial sans engager plus de EUR 50.
7. Après le seuil de validation, connecter les comptes de production Stripe, e-mail, Cloudflare et de domaine appartenant à l’utilisateur, activer le plan annuel et les sauvegardes résilientes.
8. Lancer une bêta payante clairement identifiée comme telle et recueillir de véritables preuves d’acceptation par LUCID avant de renforcer les allégations relatives au téléversement.

## 18. Risques et mesures d’atténuation

| Risque | Mesure d’atténuation |
|---|---|
| La saisie manuelle dans LUCID est gratuite | Vendre le calcul, le rapprochement, la piste d’audit et la répétabilité plutôt qu’un simple accès au XML. |
| Concurrents Shopify ou allemands existants | Être d’abord centré sur le français, le CSV et le traitement local, avec un coût inférieur et un périmètre étroit. |
| Modification du schéma réglementaire, du calendrier, d’un code ou d’un opérateur | Jeu de référence figé, surveillance hebdomadaire et externe, péremption à huit jours, état de sécurité de l’export et tests versionnés. |
| L’utilisateur fournit des poids incorrects | Ne jamais estimer ; afficher la source, la piste de calcul, les exclusions et la confirmation de l’utilisateur. |
| Les volumes diffèrent de ceux déclarés à l’opérateur | Le calcul n’alimente pas directement l’XML ; seules les masses confirmées auprès de l’opérateur le font, avec rapprochement et motif d’écart. |
| Commandes multi-colis ou regroupées | Modèle d’expédition explicite ; attestation mono-colis obligatoire lorsque l’export ne fournit aucun identifiant de colis. |
| Attentes en matière de responsabilité juridique | Périmètre explicite, liens officiels, aucun dépôt, aucune certification ni aucun conseil juridique, contenu examiné. |
| Le trafic de recherche prend des mois | Calculateur gratuit, quatre pages à forte intention, exemples utiles et diffusion facultative du lancement approuvée par l’utilisateur. |
| Perte des données locales du navigateur | Demande de persistance, surveillance du quota, imports atomiques, sauvegarde JSON versionnée, restauration et avertissements visibles. |
| Indisponibilité du serveur de droits d’accès | Jeton hors ligne signé de 30 jours, assorti d’un délai de grâce de récupération de sept jours. |
| Petit marché de niche français accessible | Le premier objectif n’est que de 7–25 clients ; n’étendre la langue ou le pays qu’après obtention de preuves. |
| Charge d’assistance | Aperçu générique des correspondances, fichiers d’exemple, diagnostics d’erreurs, aide statique et périmètre étroit. |

## 19. Décisions produit arrêtées

- Produit de travail : PackClair DE.
- Langue initiale : français.
- Juridiction et déclaration initiales : volumes d’emballages LUCID allemands uniquement.
- Entrée : CSV générique et saisie manuelle ; aucune autorisation de place de marché.
- Traitement : local dans le navigateur ; aucun stockage des données de commande sur le serveur.
- Calcul : arithmétique entière déterministe ; aucune IA générative.
- Sortie : XML généré par un sérialiseur testé contre le schéma LUCID, CSV récapitulatif et rapport d’audit.
- Modèle commercial : une offre récurrente à EUR 99 par an via Stripe, vendue initialement aux seuls clients professionnels français.
- Hébergement : PWA statique Cloudflare complétée par un service commercial minimal Worker/D1.
- Limite réglementaire : calcul préparatoire, rapprochement avec la déclaration opérateur et génération au format publié, jamais de dépôt, certification ou conclusion juridique.
- L’expansion repose sur les preuves : d’abord les intégrations, puis les langues, puis les autres pays appliquant la REP.
