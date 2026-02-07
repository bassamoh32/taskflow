# Documentation Technique – TaskFlow

Cette documentation technique est construite **uniquement à partir du README fourni** et décrit la structure interne du système via :

* le **schéma de base de données**
* le **diagramme de classes (UML)**
* les **diagrammes de séquence** pour les cas d’usage principaux

---

## 1️⃣ Schéma de Base de Données (MongoDB)

### 1.1 Collection `users`

**Rôle :** Stocker les informations des utilisateurs et gérer l’authentification / autorisation.

| Champ     | Type            | Description                 |
| --------- | --------------- | --------------------------- |
| _id       | ObjectId        | Identifiant unique          |
| name      | String          | Nom complet                 |
| email     | String (unique) | Identifiant de connexion    |
| password  | String          | Mot de passe hashé (bcrypt) |
| role      | String          | `user` ou `admin`           |
| avatar    | String          | URL image (optionnel)       |
| isActive  | Boolean         | État du compte              |
| lastLogin | Date            | Dernière connexion          |
| createdAt | Date            | Date de création            |
| updatedAt | Date            | Date de mise à jour         |

**Index :**

* `email` (unique)

---

### 1.2 Collection `tasks`

**Rôle :** Stocker les tâches et leurs métadonnées.

| Champ       | Type            | Description                               |
| ----------- | --------------- | ----------------------------------------- |
| _id         | ObjectId        | Identifiant tâche                         |
| title       | String          | Titre                                     |
| description | String          | Description                               |
| status      | String          | todo / in-progress / completed / archived |
| priority    | String          | low / medium / high / urgent              |
| dueDate     | Date            | Date limite                               |
| createdBy   | ObjectId (User) | Créateur                                  |
| assignee    | ObjectId (User) | Assigné                                   |
| tags        | [String]        | Étiquettes                                |
| comments    | Array           | Commentaires                              |
| isDeleted   | Boolean         | Soft delete                               |
| createdAt   | Date            | Création                                  |
| updatedAt   | Date            | Mise à jour                               |

**Sous-document `comments` :**

* userId (ref User)
* content
* createdAt

**Index :**

* createdBy + status
* assignee
* dueDate
* priority
* createdAt

---

### 1.3 Relations

* **User 1 — N Task** (createdBy)
* **User 1 — N Task** (assignee)
* **User 1 — N Comment**

MongoDB gère ces relations via des références (`ObjectId`).

---

## 2️⃣ Diagramme de Classes (UML – logique métier)

### 2.1 Classe `User`

**Attributs :**

* id
* name
* email
* password
* role
* isActive
* createdAt

**Méthodes :**

* register()
* login()
* comparePassword()
* generateJWT()

---

### 2.2 Classe `Task`

**Attributs :**

* id
* title
* description
* status
* priority
* dueDate
* createdBy
* assignee
* tags
* comments

**Méthodes :**

* createTask()
* updateTask()
* deleteTask()
* addComment()
* changeStatus()

---

### 2.3 Classe `AuthController`

**Responsabilité :** Gestion de l’authentification.

Méthodes :

* registerUser()
* loginUser()
* getCurrentUser()

---

### 2.4 Classe `TaskController`

Méthodes :

* createTask()
* getTasks()
* getTaskById()
* updateTask()
* deleteTask()
* addComment()
* getTaskStats()

---

### 2.5 Classe `AdminController`

Méthodes :

* getAllUsers()
* updateUserRole()
* getSystemStats()

---

### 2.6 Relations UML

* `User` ⟶ crée ⟶ `Task`
* `User` ⟶ assigné à ⟶ `Task`
* `Task` ⟶ contient ⟶ `Comment`
* `Controller` ⟶ utilise ⟶ `Model`

---

## 3️⃣ Diagrammes de Séquence

### 3.1 Séquence – Inscription utilisateur

**Acteurs :** Utilisateur → Frontend → Backend → MongoDB

**Étapes :**

1. L’utilisateur remplit le formulaire d’inscription
2. Frontend envoie `POST /auth/register`
3. Backend valide les données
4. Mot de passe hashé (bcrypt)
5. Utilisateur enregistré en base
6. JWT généré
7. Réponse envoyée au frontend
8. Utilisateur connecté automatiquement

---

### 3.2 Séquence – Connexion utilisateur

1. Utilisateur saisit email + mot de passe
2. Frontend → `POST /auth/login`
3. Backend vérifie email
4. Comparaison mot de passe hashé
5. Génération JWT
6. Token renvoyé au frontend
7. Accès aux routes protégées

---

### 3.3 Séquence – Création d’une tâche

1. Utilisateur authentifié clique "Créer tâche"
2. Frontend → `POST /tasks` (JWT inclus)
3. Middleware JWT valide le token
4. Controller valide les champs
5. Task enregistrée en base
6. Réponse avec task créée
7. Frontend met à jour la liste

---

### 3.4 Séquence – Consultation des tâches avec filtres

1. Utilisateur applique filtres
2. Frontend → `GET /tasks?status=&priority=&page=`
3. Backend construit la requête MongoDB
4. Application pagination + tri
5. Résultats retournés
6. Frontend affiche les tâches

---

### 3.5 Séquence – Ajout d’un commentaire

1. Utilisateur ouvre détail tâche
2. Soumet un commentaire
3. Frontend → `POST /tasks/{id}/comments`
4. Backend vérifie permissions
5. Commentaire ajouté au sous-document
6. Réponse envoyée
7. UI mise à jour en temps réel

---

### 3.6 Séquence – Action Admin (changer rôle)

1. Admin connecté
2. Frontend → `PUT /admin/users/{id}/role`
3. Middleware vérifie rôle admin
4. Mise à jour utilisateur
5. Confirmation envoyée

