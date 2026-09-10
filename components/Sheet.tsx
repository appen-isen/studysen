import {
    Modal,
    View,
    StyleSheet,
    TouchableWithoutFeedback
} from "react-native";
import { ReactNode, useMemo } from "react";
import { ColorPalette } from "@/constants/Colors";
import useColors from "@/hooks/useColors";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type SheetProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    children?: ReactNode;
    sheetStyle?: object;
};

export function Sheet(props: SheetProps) {
    const colors = useColors();
    const styles = useMemo(() => createStyles(colors), [colors]);
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}
            onRequestClose={() => props.setVisible(false)}
            // iOS: éviter la rotation forcée en portrait lors de l'ouverture du Modal (iPad)
            supportedOrientations={[
                "portrait",
                "portrait-upside-down",
                "landscape",
                "landscape-left",
                "landscape-right"
            ]}
            // Assure une présentation qui respecte la transparence et limite les effets de rotation
            presentationStyle="overFullScreen"
        >
            <GestureHandlerRootView style={styles.overlay}>
                <TouchableWithoutFeedback
                    onPress={() => props.setVisible(false)}
                >
                    <View style={styles.close} />
                </TouchableWithoutFeedback>
                <BottomSheet
                    enablePanDownToClose
                    onClose={() => props.setVisible(false)}
                    backgroundStyle={{ backgroundColor: colors.card }}
                    handleIndicatorStyle={{ backgroundColor: colors.lightGray }}
                >
                    <BottomSheetView style={props.sheetStyle}>
                        {props.children}
                    </BottomSheetView>
                </BottomSheet>
            </GestureHandlerRootView>
        </Modal>
    );
}

const createStyles = (colors: ColorPalette) =>
    StyleSheet.create({
        //
        // Overlay
        //
        overlay: {
            // Toujours un voile sombre, quel que soit le thème
            backgroundColor: colors.hexWithOpacity("#000000", 0.3),
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            inset: 0
        },
        close: {
            position: "absolute",
            inset: 0
        }
    });
