export default function Navbar() {
    return (
      <nav className="bg-gray-800 p-4 text-white">
        <div className="container mx-auto flex justify-between">
          <h1 className="text-2xl font-bold">Formations FFCAM</h1>
          <ul className="flex space-x-4">
            <li><a href="#" className="hover:underline">Accueil</a></li>
            <li><a href="#" className="hover:underline">À propos</a></li>
            <li><a href="https://github.com/Club-Alpin-Lyon-Villeurbanne/ffcam-formations" className="hover:underline">GitHub</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>
      </nav>
    );
  }
  