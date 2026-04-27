import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { TimelineEvent } from "../../types";

type QuickAddSidebarProps = {
  canExport: boolean;
  canImport: boolean;
  email: string | null;
  goalCount: number;
  isConfigured: boolean;
  isConnected: boolean;
  onAddGoal: (input: { duration: string; title: string }) => void;
  onCreateActivity: (input: {
    category: TimelineEvent["category"];
    description: string;
    tags: string[];
    time: string;
    title: string;
  }) => void;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onExportGoogle: () => void;
  onImportGoogle: () => void;
  selectedDateLabel: string;
  status: "idle" | "connecting" | "connected" | "error";
};

const categories: { icon: keyof typeof Feather.glyphMap; label: string; value: TimelineEvent["category"] }[] = [
  { icon: "briefcase", label: "Trabajo", value: "work" },
  { icon: "activity", label: "Bienestar", value: "wellness" },
  { icon: "coffee", label: "Ocio", value: "social" },
  { icon: "book-open", label: "Estudio", value: "focus" },
];

const reminders = ["15 min", "1 h", "Desactivar"];

export function QuickAddSidebar({
  canExport,
  canImport,
  email,
  goalCount,
  isConfigured,
  isConnected,
  onAddGoal,
  onConnectGoogle,
  onCreateActivity,
  onDisconnectGoogle,
  onExportGoogle,
  onImportGoogle,
  selectedDateLabel,
  status,
}: QuickAddSidebarProps) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDuration, setGoalDuration] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TimelineEvent["category"]>("work");
  const [selectedReminder, setSelectedReminder] = useState("15 min");
  const [feedback, setFeedback] = useState<string | null>(null);

  const createActivity = () => {
    if (!title.trim() || !time.trim()) {
      setFeedback("Cargá un título y una hora antes de crear la actividad.");
      return;
    }

    onCreateActivity({
      category: selectedCategory,
      description: description.trim() || "Bloque creado desde el panel rápido.",
      tags: [`#${selectedCategory}`],
      time: time.trim(),
      title: title.trim(),
    });

    setFeedback("Actividad creada en el calendario.");
    setTitle("");
    setTime("");
    setDescription("");
  };

  const createGoal = () => {
    if (!goalTitle.trim() || !goalDuration.trim()) {
      setFeedback("Para un objetivo, completá título y duración.");
      return;
    }

    onAddGoal({ duration: goalDuration.trim(), title: goalTitle.trim() });
    setGoalTitle("");
    setGoalDuration("");
    setFeedback("Objetivo agregado al día.");
  };

  return (
    <View className="w-full max-w-[286px] rounded-[30px] border border-white/45 bg-white/74 p-4 shadow-sm" style={{ flexShrink: 1 }}>
      <Text className="text-sm font-medium uppercase tracking-[1.5px] text-text/70">Panel de carga rápida</Text>
      <Text className="mt-2 text-sm text-text/70">Creando para {selectedDateLabel}</Text>

      <View className="mt-4 gap-3">
        <TextInput
          className="rounded-[18px] bg-white px-4 py-3 text-base text-text"
          onChangeText={setTitle}
          placeholder="Añadir actividad (título)"
          placeholderTextColor="#8A8F9E"
          value={title}
        />
        <TextInput
          className="rounded-[18px] bg-white px-4 py-3 text-base text-text"
          onChangeText={setTime}
          placeholder="Hora, ej. 17:00"
          placeholderTextColor="#8A8F9E"
          value={time}
        />
        <TextInput
          className="rounded-[18px] bg-white px-4 py-3 text-base text-text"
          onChangeText={setDescription}
          placeholder="Descripción breve"
          placeholderTextColor="#8A8F9E"
          value={description}
        />
      </View>

      <Text className="mt-5 text-base font-semibold text-text">Categoría</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {categories.map((category) => {
          const active = selectedCategory === category.value;

          return (
            <Pressable
              key={category.value}
              className={`min-w-[78px] flex-1 items-center rounded-[18px] px-2 py-3 ${active ? "bg-[#EDE5FF]" : "bg-white/80"}`}
              onPress={() => setSelectedCategory(category.value)}
            >
              <Feather color={active ? "#6D4AFF" : "#6F7483"} name={category.icon} size={18} />
              <Text className={`mt-2 text-xs font-medium ${active ? "text-accent" : "text-text/75"}`}>{category.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mt-5 text-base font-semibold text-text">Recordatorio</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {reminders.map((reminder) => (
          <Pressable
            key={reminder}
            className={`rounded-full px-4 py-2 ${selectedReminder === reminder ? "bg-white shadow-sm" : "bg-white/60"}`}
            onPress={() => setSelectedReminder(reminder)}
          >
            <Text className="text-sm font-medium text-text">{reminder}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable className="mt-5 items-center rounded-[18px] bg-accent px-4 py-4" onPress={createActivity}>
        <Text className="text-base font-semibold text-white">Crear actividad</Text>
      </Pressable>

      <View className="mt-5 rounded-[22px] bg-white/70 p-4">
        <Text className="text-base font-semibold text-text">Objetivo rápido</Text>
        <Text className="mt-1 text-sm text-text/55">{goalCount}/5 objetivos cargados</Text>
        <TextInput
          className="mt-3 rounded-[18px] bg-white px-4 py-3 text-base text-text"
          onChangeText={setGoalTitle}
          placeholder="Título del objetivo"
          placeholderTextColor="#8A8F9E"
          value={goalTitle}
        />
        <TextInput
          className="mt-3 rounded-[18px] bg-white px-4 py-3 text-base text-text"
          onChangeText={setGoalDuration}
          placeholder="Duración, ej. 1 hora"
          placeholderTextColor="#8A8F9E"
          value={goalDuration}
        />
        <Pressable className="mt-3 items-center rounded-[18px] bg-[#14151C] px-4 py-3" onPress={createGoal}>
          <Text className="text-sm font-semibold text-white">Añadir objetivo</Text>
        </Pressable>
      </View>

      <View className="mt-5 rounded-[22px] bg-[#F5F2FF] p-4">
        <Text className="text-base font-semibold text-text">Google Calendar</Text>
        <Text className="mt-1 text-sm text-text/60">
          {isConnected ? `Conectado como ${email ?? "usuario"}` : isConfigured ? "Listo para conectar" : "Faltan credenciales OAuth"}
        </Text>
        <Text className="mt-2 text-xs uppercase tracking-[1px] text-text/45">{status}</Text>

        {!isConnected ? (
          <Pressable
            className={`mt-4 items-center rounded-[18px] px-4 py-3 ${isConfigured ? "bg-accent" : "bg-border"}`}
            disabled={!isConfigured}
            onPress={onConnectGoogle}
          >
            <Text className="text-sm font-semibold text-white">{isConfigured ? "Conectar Google" : "Configurar OAuth"}</Text>
          </Pressable>
        ) : (
          <View className="mt-4 gap-2">
            <Pressable className={`items-center rounded-[18px] px-4 py-3 ${canImport ? "bg-[#14151C]" : "bg-border"}`} disabled={!canImport} onPress={onImportGoogle}>
              <Text className="text-sm font-semibold text-white">Importar eventos</Text>
            </Pressable>
            <Pressable className={`items-center rounded-[18px] px-4 py-3 ${canExport ? "bg-accent" : "bg-border"}`} disabled={!canExport} onPress={onExportGoogle}>
              <Text className="text-sm font-semibold text-white">Exportar agenda</Text>
            </Pressable>
            <Pressable className="items-center rounded-[18px] bg-white/85 px-4 py-3" onPress={onDisconnectGoogle}>
              <Text className="text-sm font-semibold text-text">Desconectar</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Text className={`mt-4 text-sm ${feedback ? "text-accent" : "text-text/50"}`}>
        {feedback ?? "Tip: al tocar una columna del calendario, cambiás el día activo."}
      </Text>
    </View>
  );
}
