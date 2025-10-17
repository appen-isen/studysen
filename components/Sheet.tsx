import {
    Modal,
    View,
    StyleSheet,
    TouchableWithoutFeedback
} from "react-native";
import { ReactNode } from "react";
import Colors from "@/constants/Colors";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type SheetProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    children?: ReactNode;
    sheetStyle?: object;
};

export function Sheet(props: SheetProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}
            onRequestClose={() => props.setVisible(false)}
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
                >
                    <BottomSheetView style={props.sheetStyle}>
                        {props.children}
                    </BottomSheetView>
                </BottomSheet>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    //
    // Overlay
    //
    overlay: {
        backgroundColor: Colors.hexWithOpacity(Colors.black, 0.3),
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        inset: 0
    },
    close: {
        ...StyleSheet.absoluteFillObject
    }
});
