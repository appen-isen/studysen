import {
    TextInput,
    StyleSheet,
    TextInputProps,
    View,
    TouchableOpacity,
    Text,
    Pressable,
} from "react-native";
import { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { CheckboxProps, Checkbox as PaperCheckbox } from "react-native-paper";

export type InputProps = {
    icon?: string;
    password?: boolean;
    smallInput?: boolean;
};

export function Input(props: TextInputProps & InputProps) {
    const [focused, setFocused] = useState(false);
    // Affichage du contenu de l'input
    const [textVisible, setTextVisible] = useState(
        props.password === undefined
    );
    const { icon, password, smallInput } = props;

    //On gère les styles en fonction des props
    let inputStyle = password
        ? withIconStyles.passwordInput
        : icon
        ? withIconStyles.input
        : styles.input;

    return (
        <View style={[styles.container, smallInput ? { width: "49%" } : {}]}>
            {/* On affiche l'icone si c'est un Input avec icone */}
            {icon && (
                <TouchableOpacity>
                    <FontAwesome
                        size={30}
                        style={withIconStyles.icon}
                        name={icon as any}
                    />
                </TouchableOpacity>
            )}
            {/* Composant Input */}
            <TextInput
                {...props}
                style={[inputStyle]}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                secureTextEntry={password && !textVisible}
                placeholder={focused ? "" : props.placeholder}
            />
            {/* Le bouton pour cacher/afficher le mot de passe */}
            {password && (
                <TouchableOpacity onPress={() => setTextVisible(!textVisible)}>
                    <FontAwesome
                        style={withIconStyles.icon}
                        name={textVisible ? "eye" : "eye-slash"}
                        size={30}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

export function Checkbox(props: CheckboxProps & { text: string }) {
    return (
        <View style={styles.checkBoxContainer}>
            <PaperCheckbox {...props} />
            <Pressable onPress={props.onPress}>
                <Text>{props.text}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.hexWithOpacity(Colors.primaryColor, 0.1),
        borderRadius: 5,
        width: "80%",
        height: 50,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        textAlign: "center",
        fontSize: 18,
        backgroundColor: "transparent",
        width: "100%",
        height: "100%",
    },
    inputFocused: {
        borderColor: "#54c2f0",
    },
    checkBoxContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
});
const withIconStyles = StyleSheet.create({
    icon: {
        width: 32,
        height: 32,
        marginLeft: 5,
    },
    input: {
        ...styles.input,
        marginRight: 15,
        width: "85%",
    },
    passwordInput: {
        ...styles.input,
        width: "75%",
    },
});
