import { useEffect, useState } from "react"
import { View, Alert, Text } from "react-native"
import MapView, { Callout, Marker } from "react-native-maps"
import * as Location from 'expo-location'

import { api } from "../services/api"
import { fontFamily, colors } from "@/src/styles/theme"
import { Categories, CategoriesProps } from "../components/categories"
import { PlaceProps } from "../components/place"
import { Places } from "../components/places"
import { router } from "expo-router"

type MarketsProps = PlaceProps & {
    latitude: number
    longitude: number
}

const currentLocation = {
    latitude: -23.561187293883442,
    longitude: -46.656451388116494
}

export default function Home() {
    const [categories, setCategories] = useState<CategoriesProps>([]);
    const [category, setCategory] = useState("");
    const [markets, setMarkets] = useState<MarketsProps[]>([]);

    async function fetchCategories() {
        try {
            const { data } = await api.get("/categories");
            setCategories(data);
            setCategory(data[0].id);
        } catch (error) {
            console.log(error);
            Alert.alert("Categorias", "Não foi possível carregar as categorias.");
        }
    }

    async function fetchMarkets() {
        if (!category) return;

        try {
            const { data } = await api.get("/markets/category/" + category);
            setMarkets(data);
        } catch (error) {
            console.log(error);
            Alert.alert("Locais", "Não foi possível carregar os locais.");
        }

    }

    async function getCurrientLocation() {
        try {
            let { granted } = await Location.requestForegroundPermissionsAsync();
            if (granted) {
                const location = await Location.getCurrentPositionAsync();
                console.log(location);
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        // getCurrientLocation();
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchMarkets()
    }, [category])


    return (
        <View style={{ flex: 1, backgroundColor: "#CECECE" }}>
            <Categories
                data={categories}
                onSelect={setCategory}
                selected={category}
            />

            <MapView
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 1,
                    longitudeDelta: 1
                }}
            >
                <Marker
                    identifier="current"
                    coordinate={{
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                    }}
                    image={require("@/src/assets/location.png")}
                />

                {markets.map((item) => (
                    <Marker
                        key={item.id}
                        identifier={item.id}
                        coordinate={{
                            latitude: item.latitude,
                            longitude: item.longitude,
                        }}
                        image={require("@/src/assets/pin.png")}
                    >
                        <Callout onPress={() => router.navigate(`/market/${item.id}`)}>
                            <View>
                                <Text
                                    style={{
                                        color: colors.gray[600],
                                        fontFamily: fontFamily.regular,
                                        fontSize: 14
                                    }}
                                >
                                    {item.name}
                                </Text>
                                <Text
                                    style={{
                                        color: colors.gray[600],
                                        fontFamily: fontFamily.regular,
                                        fontSize: 12
                                    }}
                                >
                                    {item.address}
                                </Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <Places data={markets} />
        </View>
    )
}