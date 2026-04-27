import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { analyzeSchedule, generateLumeReply } from "../../services/lumeAi";
import { ChatMessage, TimelineEvent } from "../../types";

const PANEL_WIDTH = Math.min(Dimensions.get("window").width * 0.9, 420);

type LumePanelProps = {
  events: TimelineEvent[];
  messages: ChatMessage[];
  onClose: () => void;
  onSend: (message: ChatMessage) => void;
  visible: boolean;
};

export function LumePanel({ events, messages, onClose, onSend, visible }: LumePanelProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const translateX = useRef(new Animated.Value(PANEL_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(translateX, {
      toValue: PANEL_WIDTH,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShouldRender(false);
      }
    });
  }, [translateX, visible]);

  useEffect(() => {
    if (shouldRender) {
      const timeoutId = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 80);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, shouldRender]);

  const suggestions = useMemo(() => analyzeSchedule(events), [events]);

  const handleSend = async () => {
    const value = draft.trim();

    if (!value || isThinking) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: value,
    };

    onSend(userMessage);
    setDraft("");
    setIsThinking(true);

    const reply = await generateLumeReply(value, events);

    onSend({
      id: `assistant-${Date.now() + 1}`,
      role: "assistant",
      content: reply,
    });
    setIsThinking(false);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <Modal animationType="none" transparent visible={shouldRender}>
      <View className="flex-1 flex-row justify-end bg-text/15">
        <Pressable className="flex-1" onPress={onClose} />

        <Animated.View style={{ transform: [{ translateX }] }} className="h-full" pointerEvents="box-none">
          <BlurView
            intensity={48}
            tint="light"
            style={{
              height: "100%",
              width: PANEL_WIDTH,
              overflow: "hidden",
              borderTopLeftRadius: 32,
              borderBottomLeftRadius: 32,
              borderLeftWidth: 1,
              borderColor: "rgba(255,255,255,0.4)",
            }}
          >
            <View style={{ width: PANEL_WIDTH }} className="flex-1 bg-white/72 px-5 pb-8 pt-16">
              <View className="mb-6 flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-2xl font-semibold text-text">Lume AI</Text>
                  <Text className="mt-1 text-sm leading-5 text-muted">
                    Pedí ayuda para reordenar tu agenda, planificar mejor o recuperar energía.
                  </Text>
                </View>

                <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white/80" onPress={onClose}>
                  <Feather color="#17181C" name="x" size={18} />
                </Pressable>
              </View>

              <View className="mb-5 rounded-[24px] bg-white/70 p-4">
                <Text className="text-xs font-medium uppercase tracking-[1px] text-muted">Cambios sugeridos</Text>
                {suggestions.map((suggestion) => (
                  <View key={suggestion.title} className="mt-3 rounded-[20px] bg-background px-4 py-3">
                    <Text className="text-sm font-semibold text-text">{suggestion.title}</Text>
                    <Text className="mt-1 text-sm leading-5 text-muted">{suggestion.reason}</Text>
                  </View>
                ))}
              </View>

              <ScrollView
                ref={scrollRef}
                className="flex-1"
                contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {messages.map((message) => (
                  <View
                    key={message.id}
                    className={`max-w-[88%] rounded-[24px] px-4 py-3 ${
                      message.role === "assistant" ? "self-start bg-white/85" : "self-end bg-accent"
                    }`}
                  >
                    <Text className={`text-sm leading-6 ${message.role === "assistant" ? "text-text" : "text-white"}`}>
                      {message.content}
                    </Text>
                  </View>
                ))}

                {isThinking ? (
                  <View className="self-start rounded-[24px] bg-white/85 px-4 py-3">
                    <Text className="text-sm text-muted">Lume está refinando una sugerencia...</Text>
                  </View>
                ) : null}
              </ScrollView>

              <View className="mt-4 flex-row items-end rounded-[28px] bg-white/84 px-4 py-3">
                <TextInput
                  className="flex-1 pr-3 text-base text-text"
                  onChangeText={setDraft}
                  placeholder="Pedile a Lume que reordene tu día..."
                  placeholderTextColor="#8A8F9E"
                  value={draft}
                  multiline
                />

                <Pressable className="h-12 w-12 items-center justify-center rounded-full bg-accent" onPress={handleSend}>
                  <Feather color="#FFFFFF" name="arrow-up-right" size={18} />
                </Pressable>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}
