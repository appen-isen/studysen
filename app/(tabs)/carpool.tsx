import { AnimatedPressable, MultiToggle } from "@/components/Buttons";
import { Bold, Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    RefreshControl,
    TextInput,
    FlatList
} from "react-native";
import { Page, PageHeader } from "@/components/Page";
import { Sheet } from "@/components/Sheet";
import { getResponsiveMaxWidth } from "@/utils/responsive";
import { useSyncStore } from "@/stores/syncStore";
import { syncData } from "@/services/syncService";
import { ProfileType } from "@/utils/types";

interface Profile {
    name: string;
    location: string;
    contact: string;
}

const mockProfiles: Profile[] = [
    {name: "Merlin l'Enchauteur", location: "La Chapelle-sur-Erdre", contact: "07 83 78 31 46"},
    {name: "Carol Sturka", location: "Albuquerque", contact: "@carolsturka"},
    {name: "Cthulhu", location: "Vertou", contact: "cthulhu@mail.org"},
    {name: "Père Noël", location: "Laponie", contact: "25 Avenue du Lutin, Laponie"},
    {name: "Pauline Depuydt", location: "Orvault", contact: "pauline.depuydt@isen-ouest.yncrea.fr"}
];

const ProfileItem = (profile: Profile) => {
    return (
        <View style={styles.container}>
            <Text>NOM:{profile.name}</Text>
            <Text>LOCALISATION:{profile.location}</Text>
            <Text>CONTACT:{profile.contact}</Text>
        </View>
    )
}

const ProfilesFlatlist = () => {
    const [profileList, setProfileList] = useState(mockProfiles);
    const [search, setSearch] = useState("")

    const filteredProfiles = profileList.filter((profileList) => {
        return profileList.location.toLowerCase().includes(search.toLowerCase())
    })

    return (
        <View style={styles.content}>
            <PageHeader title="Covoiturage"></PageHeader>
            <TextInput style={styles.item} placeholder="Chercher un lieu" value={search} onChangeText={setSearch} />
            <FlatList
                ItemSeparatorComponent={() => <View style={{height: 20}} />}
                data={filteredProfiles}
                renderItem={({ item }) => { 
                    return (
                        <View style={styles.profileBox}>
                            <Text style={styles.fieldTitle}>NOM</Text>
                            <Text>{item.name}</Text>
                            <Text style={styles.fieldTitle}>LOCALISATION</Text>
                            <Text>{item.location}</Text>
                            <Text style={styles.fieldTitle}>CONTACT</Text>
                            <Text>{item.contact}</Text>
                        </View>
    )}}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 35,
        flex: 1,
        backgroundColor: Colors.white
    },
    item: {
        padding: 20
    },
    profileBox: {
            backgroundColor: Colors.light,
            paddingBlock: 10,
            paddingInline: 20,
            borderRadius: 20,
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
        },
    content: {
        flex: 1,
        paddingBlock: 10,
        paddingInline: 20,
        backgroundColor: Colors.white,
        gap: 25
    },
    fieldTitle: {
        fontWeight: "bold"
    },
    flatlistContents: {
        gap: 10
    }
});

export default ProfilesFlatlist;