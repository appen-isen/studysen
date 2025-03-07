import axios from "axios";

let pingInterval: NodeJS.Timer;

const API_BASE_URL = "https://api.isen-orbit.fr/v1";

export const startPingMonitoring = () => {
    // Clear any existing interval
    if (pingInterval) {
        clearInterval(pingInterval);
    }

    // Set up the ping interval (every minute)
    pingInterval = setInterval(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/ping`);
            if (response.data.ping !== "pong") {
                console.error(
                    "Erreur de connexion: Réponse invalide du serveur",
                );
            } else {
                console.log("Ping réussi:", new Date().toLocaleString());
            }
        } catch (error) {
            console.error("Erreur de connexion au serveur:", error);
        }
    }, 60000); // 60000 ms = 1 minute

    // Initial ping
    pingServer();
};

export const stopPingMonitoring = () => {
    if (pingInterval) {
        clearInterval(pingInterval);
        console.log("Monitoring ping arrêté");
    }
};

const pingServer = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ping`);
        if (response.data.ping !== "pong") {
            console.error("Erreur de connexion: Réponse invalide du serveur");
        } else {
            console.log("Ping initial réussi:", new Date().toLocaleString());
        }

        const response2 = await axios.get(
            `https://web.isen-ouest.fr/webAurion/login`,
        );
        if (response2.status !== 200) {
            console.error("Erreur de connexion: Réponse invalide du serveur");
        } else {
            console.log(
                "Ping aurion initial réussi:",
                new Date().toLocaleString(),
            );
        }
    } catch (error) {
        console.error("Erreur de connexion au serveur:", error);
    }
};
