import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";
import PlanningList from "@/components/planning/PlanningList";
import PlanningWeek from "@/components/planning/PlanningWeek";
import useSessionStore from "@/store/sessionStore";
import { PlanningEvent } from "@/webAurion/utils/types";
import { formatDate, getNextWorkday, getEndDate } from "@/utils/date";
import { FontAwesome6 } from "@expo/vector-icons";

export default function PlanningScreen() {
    const { session } = useSessionStore();
    const [planningView, setPlanningView] = useState<"list" | "week">("list");
    const [planning, setPlanning] = useState<PlanningEvent[]>([]);
    const [currentStartDate, setCurrentStartDate] = useState(
        getNextWorkday(new Date())
    );

    useEffect(() => {
        if (session) {
            //On récupère l'emploi du temps de l'utilisateur connecté
            session
                .getPlanningApi()
                .fetchPlanning()
                .then((res: PlanningEvent[]) => {
                    setPlanning(res);
                });
        }
    }, [session]);

    // Fonction pour changer la semaine affichée
    const handleWeekChange = (previous: boolean) => {
        setCurrentStartDate((prevStart) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Date de début de journée

            const newDate = new Date(prevStart);
            if (previous) {
                const offset = -7; // On retourne une semaine en arrière
                newDate.setDate(newDate.getDate() + offset);

                // On ajuste à la date du plus proche lundi
                const day = newDate.getDay();
                const adjustment = day === 0 ? -6 : 1 - day; // Dimanche (-6) ou autre jours (1 - day)
                newDate.setDate(newDate.getDate() + adjustment);

                // Si la date est antérieure à aujourd'hui, on la remet à aujourd'hui
                if (newDate < today) {
                    return today;
                }
            } else {
                const offset = 7; // On avance d'une semaine
                newDate.setDate(newDate.getDate() + offset);

                // On ajuste à la date du plus proche lundi
                const day = newDate.getDay();
                const adjustment = day === 0 ? -6 : 1 - day; // Dimanche (-6) ou autre jours (1 - day)
                newDate.setDate(newDate.getDate() + adjustment);
            }

            return newDate;
        });
    };

    const handlePlanningViewChange = (view: "list" | "week") => {
        setPlanningView(view);
        // On reset la date de début de la semaine
        setCurrentStartDate(getNextWorkday(new Date()));
    };
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
                    onPress={() => handlePlanningViewChange("list")}
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
                    onPress={() => handlePlanningViewChange("week")}
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

            {/* Sélecteur de semaine */}
            <View style={styles.weekSelector}>
                <Pressable onPress={() => handleWeekChange(true)}>
                    <FontAwesome6
                        name="chevron-left"
                        style={styles.weekChevronIcon}
                    />
                </Pressable>
                <Text style={styles.weekText}>
                    Du {formatDate(currentStartDate)} au{" "}
                    {formatDate(getEndDate(currentStartDate))}
                </Text>
                <Pressable onPress={() => handleWeekChange(false)}>
                    <FontAwesome6
                        name="chevron-right"
                        style={styles.weekChevronIcon}
                    />
                </Pressable>
            </View>

            {/* Affichage de l'emploi du temps */}
            {planningView === "list" && (
                <PlanningList events={planning} startDate={currentStartDate} />
            )}
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
        boxShadow: "0px 2px 5px 0px rgba(0,0,0,0.25)",
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

    //Sélecteur de semaine
    weekSelector: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "90%",
        marginBottom: 10,
    },
    weekChevronIcon: {
        fontSize: 30,
        color: Colors.primaryColor,
        paddingHorizontal: 10,
    },
    weekText: {
        fontSize: 18,
        marginHorizontal: 5,
    },
});
