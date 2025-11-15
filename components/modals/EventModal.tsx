import { PlanningEvent } from "@/webAurion/utils/types";
import { View, StyleSheet, Linking } from "react-native";
import { Text } from "../Texts";
import Colors from "@/constants/Colors";

import { Sheet } from "../Sheet";
import { MaterialIcons } from "@expo/vector-icons";
import { formatFullDate } from "@/utils/date";
import { getSubjectColor, getSubjectIcon } from "@/utils/colors";
import { Button } from "../Buttons";
import { useCallback, useMemo } from "react";

type EventModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    event: PlanningEvent;
};
export default function EventModal(props: EventModalProps) {
    const { event, visible, setVisible } = props;

    // Extraire le lien de réunion s'il y en a un
    const { cleanText: learnersText, meetingLink } = useMemo(() => {
        if (!event.learners) {
            return {
                cleanText: "",
                meetingLink: undefined as string | undefined
            };
        }

        const TEAMS_LINK_REGEX =
            /\*\*lien\*\*(https?:\/\/[^$\s]+)\$\$lien\$\$/i;
        const match = event.learners.match(TEAMS_LINK_REGEX);
        const link = match?.[1];
        const cleanText = event.learners
            .replace(TEAMS_LINK_REGEX, "")
            .replace(/\s{2,}/g, " ")
            .trim();

        return { cleanText, meetingLink: link };
    }, [event.learners]);

    const handleOpenMeeting = useCallback(async () => {
        if (!meetingLink) return;
        try {
            const supported = await Linking.canOpenURL(meetingLink);
            if (supported) {
                await Linking.openURL(meetingLink);
            }
        } catch (error) {
            console.warn("Unable to open meeting link", error);
        }
    }, [meetingLink]);
    return (
        <Sheet
            sheetStyle={popupStyles.container}
            visible={visible}
            setVisible={setVisible}
        >
            <View style={popupStyles.headerBox}>
                <View
                    style={[
                        popupStyles.headerIcon,
                        {
                            backgroundColor: getSubjectColor(event.subject)
                        }
                    ]}
                >
                    <MaterialIcons
                        name={getSubjectIcon(event.subject)}
                        size={14}
                    />
                </View>
                <View>
                    <Text style={popupStyles.headerTitle}>
                        {event.title || event.subject}
                    </Text>
                    <Text style={popupStyles.headerSubtitle}>
                        {event.className}
                    </Text>
                </View>
            </View>
            <View style={popupStyles.fieldBox}>
                <Text style={popupStyles.fieldTitle}>Date de début</Text>
                <Text style={[popupStyles.fieldTag, popupStyles.fieldTagLight]}>
                    {formatFullDate(new Date(event.start))}
                </Text>
            </View>
            <View style={popupStyles.fieldBox}>
                <Text style={popupStyles.fieldTitle}>Date de fin</Text>
                <Text style={[popupStyles.fieldTag, popupStyles.fieldTagLight]}>
                    {formatFullDate(new Date(event.end))}
                </Text>
            </View>
            <View style={popupStyles.fieldBox}>
                <Text style={popupStyles.fieldTitle}>Salle</Text>
                <Text style={[popupStyles.fieldTag, popupStyles.fieldTagBlack]}>
                    {event.room || "?"}
                </Text>
            </View>
            <View>
                <Text style={popupStyles.fieldTitle}>Assuré par</Text>
                <Text style={popupStyles.fieldValue}>{event.instructors}</Text>
            </View>
            <View>
                <Text style={popupStyles.fieldTitle}>Pour les groupes</Text>
                <Text style={popupStyles.fieldValue}>
                    {learnersText || event.learners || "—"}
                </Text>
                {meetingLink && (
                    <Button
                        title="Rejoindre la réunion"
                        onPress={handleOpenMeeting}
                        style={popupStyles.meetingButton}
                        textStyle={popupStyles.meetingButtonText}
                    />
                )}
            </View>
        </Sheet>
    );
}

const popupStyles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 20
    },
    headerBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    headerIcon: {
        width: 22,
        height: 22,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center"
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 400
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: 400,
        color: Colors.gray
    },
    fieldTitle: {
        fontSize: 10,
        fontWeight: 700,
        color: Colors.gray,
        textTransform: "uppercase"
    },
    fieldBox: {
        gap: 4,
        alignItems: "flex-start"
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: 400
    },
    fieldTag: {
        paddingBlock: 5,
        paddingInline: 10,
        borderRadius: 5,
        textAlign: "center",
        fontSize: 12,
        fontWeight: 600
    },
    fieldTagLight: {
        backgroundColor: Colors.light
    },
    fieldTagBlack: {
        backgroundColor: Colors.black,
        color: Colors.white
    },
    meetingButton: {
        marginTop: 10,
        alignSelf: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.primary,
        borderRadius: 8
    },
    meetingButtonText: {
        fontSize: 14,
        fontWeight: 600
    }
});
