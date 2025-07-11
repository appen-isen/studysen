import { Page, PageHeader } from "@/components/Page";
import { PostType } from "@/utils/types";
import { FlatList, StyleSheet, View } from "react-native";
import { Post } from "../post-details";
import { DotLoader } from "@/components/Sync";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/utils/config";
import axios from "axios";
import Colors from "@/constants/Colors";
import { Bold } from "@/components/Texts";
import useSettingsStore, { campusToId } from "@/stores/settingsStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { getResponsiveMaxWidth } from "@/utils/responsive";

export default function ClubsScreen() {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [isFirstLoading, setIsFirstLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { settings } = useSettingsStore();

    const fetchLatestPost = async (
        offset: number
    ): Promise<PostType | null> => {
        try {
            //On récupère le X dernier post
            const response = await axios.get(
                `${API_BASE_URL}/posts/last?offset=${offset}&campus=${campusToId(
                    settings.campus
                )}`
            );
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des posts :", error);
            return null;
        }
    };

    // Fonction pour charger un post
    const loadPosts = async () => {
        setIsLoading(true);
        const newPost = await fetchLatestPost(offset);
        if (newPost) {
            setPosts((prev) => [...prev, newPost]);
            setOffset((prev) => prev + 1);
        } else {
            setHasMore(false);
        }
        setIsLoading(false);
    };

    // Chargement initial des 3 premiers posts
    useEffect(() => {
        const loadInitialPosts = async () => {
            let localOffset = offset;
            for (let i = 0; i < 3; i++) {
                const newPost = await fetchLatestPost(localOffset);
                if (newPost) {
                    // On ajoute le post à la liste des posts
                    setPosts((prev) => [...prev, newPost]);

                    localOffset += 1;
                } else {
                    setHasMore(false);
                    break;
                }
            }
            setOffset(localOffset);
            setIsFirstLoading(false);
            setIsLoading(false);
        };

        loadInitialPosts();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <PageHeader title="Clubs"></PageHeader>
                <FlatList
                    data={posts}
                    contentContainerStyle={styles.scrollContainer}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => <Post post={item} />}
                    onEndReached={() => {
                        // Si le chargement initial est terminé, on charge les nouveaux posts
                        // On ne charge plus si le dernier fetch n'a rien ramené
                        if (!isFirstLoading && !isLoading && hasMore) {
                            loadPosts();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isLoading ? (
                            <DotLoader />
                        ) : !hasMore && posts.length === 0 ? (
                            <Bold style={styles.noPostsText}>
                                Aucun post à afficher
                            </Bold>
                        ) : null
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    content: {
        flex: 1,
        paddingBlock: 10,
        paddingInline: 20,
        backgroundColor: Colors.white,
        gap: 25
    },
    scrollContainer: {
        maxWidth: getResponsiveMaxWidth(),
        width: "100%",
        alignSelf: "center"
    },
    noPostsText: {
        fontSize: 20,
        alignSelf: "center"
    }
});
