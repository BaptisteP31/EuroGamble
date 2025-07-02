import { useState } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from './pages/LoginPage';

function Home() {
  return (
    <div className="container py-5">
      <div className="card p-5 shadow-sm mx-auto" style={{ maxWidth: 600 }}>
        <h1 className="mb-4 text-center text-primary">Bienvenue sur EuroGamble !</h1>
        <p className="lead text-center">
          EuroGamble est le jeu de pronostics dédié à la grande finale de l'Eurovision.<br />
          Tentez de deviner le classement final des pays et défiez vos amis !
        </p>
        <hr />
        <ul className="mb-4">
          <li>Classez chaque pays selon votre intuition.</li>
          <li>Plus votre prédiction est précise, plus vous marquez de points.</li>
          <li>Comparez vos résultats avec ceux des autres joueurs.</li>
          <li>Partagez la passion de l'Eurovision dans une ambiance ludique et conviviale.</li>
        </ul>
        <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
          <Link className="btn btn-primary btn-lg" to="/login">
            Commencer à jouer
          </Link>
          <Link className="btn btn-outline-secondary btn-lg" to="/about">
            En savoir plus
          </Link>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">À propos de EuroGamble</h1>
      <div className="card p-4 mx-auto" style={{ maxWidth: 600 }}>
        <p>
          <strong>EuroGamble</strong> est une application web inspirée d’un jeu sur papier autour du concours de l’Eurovision. Le principe&nbsp;: devinez le classement final des pays lors de la grande finale&nbsp;!
        </p>
        <p>
          Le jeu propose de placer chaque pays à la position que vous pensez être la sienne dans le classement final. Plus votre prédiction est précise, plus vous marquez de points&nbsp;:
        </p>
        <ul>
          <li>100 points pour un pays bien placé</li>
          <li>70 points à une place près</li>
          <li>50 points à deux places près</li>
          <li>30 points à trois places près</li>
          <li>10 points à quatre places près</li>
          <li>0 point au-delà</li>
        </ul>
        <p>
          Les meilleurs pronostics sont récompensés&nbsp;: le gagnant rapporte <strong>300%</strong> des points, le deuxième <strong>250%</strong>, le troisième <strong>200%</strong> et le dernier <strong>150%</strong>.
        </p>
        <p>
          Ce projet est une adaptation numérique moderne, pensée pour rendre le jeu accessible à tous, entre amis ou en famille, et partager la passion de l’Eurovision de façon ludique&nbsp;!
        </p>
        <div className="d-flex justify-content-between mt-4">
          <a
            className="btn btn-outline-secondary"
            href="https://github.com/BaptisteP31/EuroGamble"
            target="_blank"
            rel="noopener noreferrer"
          >
            Voir le projet sur GitHub
          </a>
          <Link className="btn btn-primary" to="/">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { auth } = useAuth();
  const location = useLocation();
  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppContent() {
  const [count, setCount] = useState(0);
  const { auth, logout } = useAuth();

  return (
    <>
      <nav className="navbar navbar-expand navbar-dark bg-dark mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/">EuroGamble</Link>
          <div className="navbar-nav">
            <Link className="nav-link" to="/">Accueil</Link>
            <Link className="nav-link" to="/about">A propos</Link>
            {auth ? (
              <button className="nav-link btn btn-link text-light" style={{border:0,background:'none'}} onClick={logout}>Déconnexion</button>
            ) : (
              <Link className="nav-link" to="/login">Connexion</Link>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
