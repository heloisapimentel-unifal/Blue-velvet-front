import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white w-screen h-screen overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;600;800&display=swap');

        :root {
            --primary-blue: #003366;
            --light-blue: #4da6ff;
            --bar-width: 12px;
            --bar-gap: 6px;
        }

        .loader-wrapper {
            font-family: 'Montserrat', sans-serif;
        }

        .loader-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .equalizer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--bar-gap);
            height: 100px;
            margin-bottom: 25px;
        }

        .bar {
            width: var(--bar-width);
            background: linear-gradient(to top, var(--primary-blue), var(--light-blue));
            border-radius: 20px;
            box-shadow: 0 4px 10px rgba(0, 51, 102, 0.25);
            animation: bounce 1.2s ease-in-out infinite;
        }

        .bar:nth-child(1) { height: 40px; animation-delay: 0.1s; animation-duration: 1s; }
        .bar:nth-child(2) { height: 60px; animation-delay: 0.3s; animation-duration: 1.4s; }
        .bar:nth-child(3) { height: 90px; animation-delay: 0.0s; animation-duration: 1.1s; }
        .bar:nth-child(4) { height: 50px; animation-delay: 0.4s; animation-duration: 1.3s; }
        .bar:nth-child(5) { height: 80px; animation-delay: 0.2s; animation-duration: 1.2s; }
        .bar:nth-child(6) { height: 30px; animation-delay: 0.5s; animation-duration: 0.9s; }
        .bar:nth-child(7) { height: 70px; animation-delay: 0.1s; animation-duration: 1.5s; }

        .brand-text {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .brand-text h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: -1px;
            color: var(--primary-blue);
            line-height: 1;
        }

        .brand-text h2 {
            font-size: 0.9rem;
            font-weight: 500;
            margin: 8px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 4px;
            color: var(--light-blue);
        }

        @keyframes bounce {
            0%, 100% {
                height: 20%;
                opacity: 0.7;
            }
            50% {
                height: 100%;
                opacity: 1;
                filter: drop-shadow(0 0 8px rgba(77, 166, 255, 0.6));
            }
        }
      `}</style>

      <div className="loader-wrapper">
        <div className="loader-container">
            {/* Equalizador */}
            <div className="equalizer">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>

            {/* Texto da Marca */}
            <div className="brand-text">
                <h1>BlueVelvet</h1>
                <h2>Music Store</h2>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;