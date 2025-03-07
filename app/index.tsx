import { Redirect } from "expo-router";
import "react-native-get-random-values";

export default function App() {
    //On redirige directement sur la page login
    return <Redirect href={"/login"} />;
}
