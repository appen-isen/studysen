import {
    TextInput,
    StyleSheet,
    TextInputProps,
    View,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { CheckboxProps, Checkbox as PaperCheckbox } from "react-native-paper";
import { Text } from "@/components/Texts";

export type InputProps = {
    icon?: React.ReactNode;
    password?: boolean;
    smallInput?: boolean;
    autoComplete?: string;
    textInputStyle?: object;
    containerStyle?: object;
};

export function Input(props: TextInputProps & InputProps) {
    const [focused, setFocused] = useState(false);
    // Affichage du contenu de l'input
    const [textVisible, setTextVisible] = useState(
        props.password === undefined,
    );
    const {
        icon,
        password,
        smallInput,
        autoComplete,
        textInputStyle,
        containerStyle,
    } = props;

    //On gère les styles en fonction des props
    let inputStyle = password
        ? withIconStyles.passwordInput
        : icon
          ? withIconStyles.input
          : styles.input;

    return (
        <View
            style={[
                styles.container,
                smallInput ? { width: "49%" } : {},
                containerStyle,
            ]}
        >
            {/* On affiche l'icone si c'est un Input avec icone */}
            {icon && <TouchableOpacity>{icon}</TouchableOpacity>}
            {/* Composant Input */}
            <TextInput
                {...props}
                onFocus={() => setFocused(true)}
                onEndEditing={() => setFocused(false)}
                secureTextEntry={password && !textVisible}
                placeholder={focused ? "" : props.placeholder}
                placeholderTextColor={Colors.gray}
                style={[inputStyle, textInputStyle]}
                autoComplete={autoComplete}
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
        borderRadius: 15,
        width: "100%",
        height: 50,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        textAlign: "center",
        fontSize: 18,
        backgroundColor: "transparent",
        width: "100%",
        height: "95%",
    },
    inputFocused: {
        borderColor: "#54c2f0",
    },
    checkBoxContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        transform: [{ scale: 1.2 }],
    },
});

const issueStyles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.hexWithOpacity(Colors.primaryColor, 0.1),
        borderRadius: 15,
        width: "100%",
        height: 50,
        marginBottom: 20,
    },
    inputFocused: {
        borderColor: "#54c2f0",
    },
    checkBoxContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        transform: [{ scale: 1.2 }],
    },
});

const withIconStyles = StyleSheet.create({
    icon: {
        fontSize: 30,
        marginRight: 5,
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
