import PlanningApi from "./PlanningApi";
import axios, { AxiosInstance } from "axios";
import { hashPassword } from "@/utils/password";

interface User {
    user_id: number;
    email: string;
    username: string;
    promo: string;
    isenId: string;
}

interface AuthResponse {
    user: User;
    token: string;
}

export class Session {
    private client: AxiosInstance;
    private backendURL: string = "https://api.isen-orbit.fr/v1";
    private user: User | null = null;
    private demo_mode: boolean = false;
    private readonly SALT_ROUNDS = 10;

    constructor() {
        this.client = axios.create({
            baseURL: this.backendURL,
            headers: { "Content-Type": "application/json" },
        });
    }

    public async register(
        email: string,
        password: string,
        username: string,
        promo: string,
        campus: string,
        isenId: string,
    ): Promise<boolean> {
        try {
            const hashedPassword = await hashPassword(password);
            const response = await this.client.post<AuthResponse>("/register", {
                email,
                password: hashedPassword,
                username,
                promo,
                campus,
                isenId,
            });

            this.user = response.data.user;
            this.client.defaults.headers.common["Authorization"] =
                `Bearer ${response.data.token}`;

            return true;
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                throw new Error(
                    `Registration failed: ${error.response?.data?.message || error.message}`,
                );
            }
            throw error;
        }
    }

    public async login(
        email: string,
        password: string,
        token?: string,
    ): Promise<boolean> {
        try {
            if (email === "demo" && password === "demo") {
                this.demo_mode = true;
                this.user = {
                    user_id: 0,
                    email: "demo@demo.com",
                    username: "Demo User",
                    promo: "DEMO",
                    isenId: "0000",
                };
                return true;
            }

            let response;
            if (token) {
                response = await this.client.post<AuthResponse>("/login", {
                    token,
                });
            } else {
                const hashedPassword = await hashPassword(password);
                response = await this.client.post<AuthResponse>("/login", {
                    email,
                    password: hashedPassword,
                });
            }

            this.user = response.data.user;
            this.client.defaults.headers.common["Authorization"] =
                `Bearer ${response.data.token}`;

            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    `Login failed: ${error.response?.data?.message || error.message}`,
                );
            }
            throw error;
        }
    }

    public getUsername(): string {
        return this.user?.username || "";
    }

    // API pour le calendrier
    public getPlanningApi(): PlanningApi {
        return new PlanningApi(this);
    }

    public getEmail(): string {
        return this.user?.email || "";
    }

    public getPromo(): string {
        return this.user?.promo || "";
    }

    public getIsenId(): string {
        return this.user?.isenId || "";
    }

    public getToken(): string {
        return this.client.defaults.headers.common["Authorization"] || "";
    }

    public isDemo(): boolean {
        return this.demo_mode;
    }

    public sendGET<T>(url: string): Promise<T> {
        return this.client.get<T>(url).then((response) => response.data);
    }

    public sendPOST<T>(url: string, data: unknown): Promise<T> {
        return this.client.post<T>(url, data).then((response) => response.data);
    }
}

export default Session;
