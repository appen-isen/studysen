import { getSecureStoreItem } from "@/store/secureStore";
import { Redirect } from "expo-router";
import { useEffect } from "react";

export default function App() {
    //On redirige directement sur la page login
    return <Redirect href={"/login"} />;
}
