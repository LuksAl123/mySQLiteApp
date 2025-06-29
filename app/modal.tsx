import { router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ItemModal() {
  // gat the id from the url
  const { id } = useLocalSearchParams();

  // local state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // local state for edit mode
  const [editMode, setEditMode] = useState(false);

  // get the database context
  const database = useSQLiteContext();

  useEffect(() => {
    if (id) {
      // if id is present, then we are in edit mode
      setEditMode(true);
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    const result = await database.getFirstAsync<{
      name: string;
      email: string;
    }>(`SELECT name, email FROM users WHERE id = ?`, [parseInt(id as string)]);
    setName(result?.name!);
    setEmail(result?.email!);
  };

  const handleSave = async () => {
    try {
      const response = await database.runAsync(
        `INSERT INTO users (name, email) VALUES (?, ?)`,
        [name, email]
      );
      console.log("Item saved successfully:", response?.changes!);
      router.back();
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setName("");
      setEmail("");
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await database.runAsync(
        `UPDATE users SET name = ?, email = ? WHERE id = ?`,
        [name, email, parseInt(id as string)]
      );
      console.log("Item updated successfully:", response?.changes!);
      router.back();
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setName("");
      setEmail("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Item Modal" }} />
      <View
        style={{
          gap: 20,
          marginVertical: 20,
        }}
      >
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={(text) => setName(text)}
          style={styles.textInput}
        />
        <TextInput
          placeholder="Email"
          value={email}
          keyboardType="email-address"
          onChangeText={(text) => setEmail(text)}
          style={styles.textInput}
        />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 20 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.button, { backgroundColor: "red" }]}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            editMode ? handleUpdate() : handleSave();
          }}
          style={[styles.button, { backgroundColor: "blue" }]}
        >
          <Text style={styles.buttonText}>{editMode ? "Update" : "Save"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  textInput: {
    borderWidth: 1,
    padding: 10,
    width: 300,
    borderRadius: 5,
    borderColor: "slategray",
  },
  button: {
    height: 40,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
  },
});