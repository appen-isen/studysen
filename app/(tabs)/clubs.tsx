import { Page, PageHeader } from "@/components/Page";
import { PostType } from "@/utils/types";
import { FlatList, StyleSheet } from "react-native";
import { Post } from "../post-details";
import { DotLoader } from "@/components/Sync";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/utils/config";
import axios from "axios";

export default function ClubsScreen() {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [offset, setOffset] = useState(0);

    const fetchLatestPost = async (offset: number): Promise<PostType[]> => {
        try {
            //On récupère le X dernier post
            const response = await axios.get(
                `${API_BASE_URL}/v1/posts/latest?offset=${offset}`
            );
            return response.data.posts;
        } catch (error) {
            console.error("Erreur lors de la récupération des posts :", error);
            return [];
        }
    };

    //On charge les posts un par un
    const loadPosts = async () => {
        setIsLoading(true);
        const newPosts = await fetchLatestPost(offset);

        setPosts((prev) => [...prev, ...newPosts]);
        setOffset((prev) => prev + 1);
        setIsLoading(false);
    };

    useEffect(() => {
        //On charge les 3 premiers posts au démarrage
        const loadInitialPosts = async () => {
            for (let i = 0; i < 3; i++) {
                await loadPosts(); // Charge un post à la fois
            }
        };

        loadInitialPosts();
    }, []);

    return (
        <Page style={styles.container}>
            <PageHeader title="Clubs"></PageHeader>
            <FlatList
                data={posts}
                contentContainerStyle={styles.scrollContainer}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => <Post post={item} />}
                onEndReached={loadPosts}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isLoading ? <DotLoader /> : null}
            />
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 25
    },
    scrollContainer: {
        alignSelf: "center"
    }
});
