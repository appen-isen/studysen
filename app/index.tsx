import { Redirect } from "expo-router";

export default function App() {
    //On redirige directement sur la page login
    return <Redirect href={"/login"} />;
}
