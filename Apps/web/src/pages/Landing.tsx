export default function Landing() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <svg style={{ margin: "30px" }} width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path fill="var(--primary-color)" d="
                    M35,0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35 Z
                    M35,35 
                    L35,10 
                    A25,25 0 0 1 10,35 
                    L10,35 
                    Z
                    M65,65 
                    L65,90 
                    A25,25 0 0 1 90,65 
                    L90,65 
                    Z"
                    fill-rule="evenodd"
                />
            </svg>

            <h1 className="text-4xl font-bold mb-4">Welcome to Our Healthcare App</h1>
            <p className="text-lg mb-8">Your health, our priority.</p>
            <a
                href="/login"
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
                Get Started
            </a>
        </div>
    );
}