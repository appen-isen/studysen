import { TextInput, StyleSheet, TextInputProps, View, TouchableOpacity, Pressable, Keyboard } from "react-native";
import { useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Colors from "@/constants/Colors";
import { CheckboxProps, Checkbox as PaperCheckbox } from "react-native-paper";
import { Text } from "@/components/Texts";

export type InputProps = {
    icon?: keyof typeof MaterialIcons.glyphMap;
    password?: boolean;
    autoComplete?: string;
    textInputStyle?: object;
    containerStyle?: object;
};

export function Input(props: TextInputProps & InputProps) {
    const [textVisible, setTextVisible] = useState(
        props.password === undefined
    );
    const {
        icon,
        password,
        autoComplete,
        textInputStyle,
        containerStyle,
    } = props;
    
    useEffect(() => {
      const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
        Keyboard.dismiss();
      });
  
      return () => {
        keyboardHideListener.remove();
      };
    }, []);

    return (
        <View
            style={[
                inputStyles.container,
                containerStyle,
            ]}
        >
            {/* On affiche l'icone si c'est un Input avec icone */}
            {icon && <MaterialIcons name={icon} size={30} style={inputStyles.icon} />}
            {/* Composant Input */}
            <TextInput
                {...props}
                secureTextEntry={password && !textVisible}
                placeholder={props.placeholder}
                placeholderTextColor={Colors.gray}
                style={[inputStyles.input, textInputStyle]}
                autoComplete={autoComplete}
                numberOfLines={1}
            />
            {/* Le bouton pour cacher/afficher le mot de passe */}
            {password && (
                <TouchableOpacity onPress={() => setTextVisible(!textVisible)}>
                    <MaterialIcons
                        style={inputStyles.icon}
                        name={textVisible ? "visibility" : "visibility-off"}
                        size={30}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

export function Checkbox(props: CheckboxProps & { text: string }) {
    return (
        <View style={checkboxStyles.container}>
            <PaperCheckbox {...props} />
            <Pressable onPress={props.onPress}>
                <Text style={checkboxStyles.label}>{props.text}</Text>
            </Pressable>
        </View>
    );
}

const inputStyles = StyleSheet.create({
    //
    // Container
    //
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.light,
        borderRadius: 15,
        paddingInline: 15,
        paddingBlock: 5,
        gap: 5,
        width: "100%",
    },
    //
    // Input
    //
    input: {
        flex: 1,
        fontSize: 18,
        backgroundColor: "transparent",
    },
    //
    // Icon
    //
    icon: {
        fontSize: 24,
        color: Colors.gray,
    },
});

const checkboxStyles = StyleSheet.create({
    //
    // Container
    //
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    //
    // Label
    //
    label: {
        color: Colors.darkGray,
        fontSize: 16,
    },
});
