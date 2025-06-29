import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";

type UserType = { id: number; name: string; email: string};

export default function TabHome() {
  const [data, setData] = useState<UserType[]>([]);

  const database = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      loadData(); // Fetch data when the screen is focused
    }, [])
  );

  const loadData = async () => {
    const result = await database.getAllAsync<UserType>("SELECT * FROM users;");
    setData(result);
  };

  const handleDelete = async (id: number) => {
    try {
      await database.runAsync(`DELETE FROM users WHERE id = ?`, [id]);
      loadData();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  
  const headerRight = () => {
    return (
    <TouchableOpacity
      onPress={() => router.push("/modal")}
      style={{ marginRight: 10 }}
    >
      <FontAwesome name="plus-circle" size={28} color="blue" />
    </TouchableOpacity>
    )
  };

  return (
    <View>
      <Stack.Screen options={{ headerRight }} />
      <View>
        <FlatList
          data={data}
          renderItem={({ item } : {
            item: { id: number; name: string; email: string };
          }) => {
            return (
              <View style={{ padding: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text>{item.name}</Text>
                    <Text>{item.email}</Text>
                  </View>
                  <View style={{
                    flex: 1, 
                    flexDirection: "row", 
                    justifyContent: "flex-end",
                    gap: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        router.push(`/modal?id=${item.id}`);
                      }}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        handleDelete(item.id);
                      }}
                      style={[styles.button, { backgroundColor: "red"}]}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 30,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "blue",
    alignContent: "flex-end",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
});