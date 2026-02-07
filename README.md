# TaskFlow

TaskFlow est une application web de gestion de tâches permettant aux utilisateurs de créer, organiser et suivre leurs tâches de manière simple et efficace. L’application intègre un système d’authentification sécurisé, la gestion des rôles (utilisateur / administrateur) ainsi que des fonctionnalités collaboratives comme les commentaires.

---

## 🌐 Application déployée

* **Frontend (Vercel)** : [https://task-hub-lyart.vercel.app/](https://task-hub-lyart.vercel.app/)
* **Backend (Render)** : [https://task-hub-j8ib.onrender.com](https://task-hub-j8ib.onrender.com)

---

### Déploiement

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas (Base de données)

---

## ✨ Fonctionnalités

### Utilisateur

* Inscription et connexion sécurisées
* Création, modification et suppression de tâches
* Consultation des tâches avec filtres (statut, priorité)
* Ajout de commentaires sur les tâches
* Gestion du profil utilisateur

### Administrateur

* Gestion des utilisateurs
* Modification des rôles (User / Admin)
* Supervision globale des tâches

---

## 🧱 Architecture du projet

Le projet suit une architecture **MVC (Model – View – Controller)** :

* **Models** : Schémas MongoDB (User, Task)
* **Controllers** : Logique métier et traitement des requêtes
* **Routes** : Définition des endpoints de l’API REST
* **Middlewares** : Authentification, autorisation, gestion des erreurs

---

## 🗄️ Schéma de la base de données

### User

* _id : ObjectId
* name : String
* email : String (unique)
* password : String (hashé)
* role : String (USER / ADMIN)
* createdAt : Date

### Task

* _id : ObjectId
* title : String
* description : String
* status : String (todo / in-progress / done)
* priority : String (low / medium / high)
* user : ObjectId (référence User)
* comments : Array
* createdAt : Date

---

## 🔌 API – Endpoints principaux

### Authentification

* `POST /api/auth/register` → Inscription
* `POST /api/auth/login` → Connexion

### Tâches

* `GET /api/tasks` → Récupérer les tâches
* `POST /api/tasks` → Créer une tâche
* `PUT /api/tasks/:id` → Modifier une tâche
* `DELETE /api/tasks/:id` → Supprimer une tâche

### Utilisateurs (Admin)

* `GET /api/users` → Liste des utilisateurs
* `PUT /api/users/:id/role` → Modifier le rôle

---

## ⚙️ Installation en local

### Prérequis

* Node.js (v18+ recommandé)
* MongoDB

### Backend

```bash
cd backend
npm install
npm run dev
```

Créer un fichier `.env` :

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

### Frontend

```bash
cd frontend
npm install
npm start
```
