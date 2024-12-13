import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Colors from "@/constants/Colors";
import { useState } from "react";
import PlanningList from "@/components/planning/PlanningList";
import PlanningWeek from "@/components/planning/PlanningWeek";
import useSessionStore from "@/store/sessionStore";
import { PlanningEvent } from "@/webAurion/utils/types";

export default function PlanningScreen() {
    const { session } = useSessionStore();
    const [planningView, setPlanningView] = useState<"list" | "week">("list");
    const [planning, setPlanning] = useState<PlanningEvent[]>([]);
    session
        ?.getPlanningApi()
        .fetchPlanning()
        .then((res: PlanningEvent[]) => {
            setPlanning(res);
        });
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Empoi du temps</Text>
            {/* Sélecteur pour l'affichage de l'emploi du temps */}
            <View style={styles.planningViewSelector}>
                {/* Boutons pour change l'affichage de l'emploi du temps (mode liste ou mode semaine) */}
                <Pressable
                    style={[
                        styles.viewSelectorList,
                        planningView === "list" && {
                            backgroundColor: Colors.primaryColor,
                        },
                    ]}
                    onPress={() => setPlanningView("list")}
                >
                    <MaterialCommunityIcons
                        name="calendar-text-outline"
                        style={[
                            styles.selectorIcon,
                            //On change la couleur si le mode liste est actif
                            {
                                color:
                                    planningView === "list" ? "white" : "black",
                            },
                        ]}
                    />
                </Pressable>
                <Pressable
                    style={[
                        styles.viewSelectorWeek,
                        planningView === "week" && {
                            backgroundColor: Colors.primaryColor,
                        },
                    ]}
                    onPress={() => setPlanningView("week")}
                >
                    <MaterialCommunityIcons
                        name="calendar-range-outline"
                        style={[
                            styles.selectorIcon,
                            //On change la couleur si le mode semaine est actif
                            {
                                color:
                                    planningView === "week" ? "white" : "black",
                            },
                        ]}
                    />
                </Pressable>
            </View>

            {/* Affichage de l'emploi du temps */}
            {planningView === "list" && <PlanningList events={planning} />}
            {planningView === "week" && <PlanningWeek />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "white",
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        color: Colors.primaryColor,
        marginTop: 20,
    },
    // Style du sélecteur de l'affichage de l'emploi du temps
    planningViewSelector: {
        display: "flex",
        flexDirection: "row",
        alignSelf: "flex-end",
        marginTop: 20,
        marginRight: 20,
        marginBottom: 20,
        backgroundColor: "white",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    viewSelectorList: {
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 2,
    },
    viewSelectorWeek: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 2,
    },
    selectorIcon: {
        fontSize: 30,
    },
});
