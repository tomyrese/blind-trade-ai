import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, MessageSquare, Sparkles, User, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { openRouterService } from '../../../../shared/services/OpenRouterService';
import { useMarkets } from '../../../../shared/hooks/useMarkets';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatInput = React.memo(({ onSend }: { onSend: (text: string) => void }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <View style={styles.inputArea}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { maxHeight: 100 }]}
          placeholder="Hỏi Poké-AI..."
          placeholderTextColor="#94a3b8"
          value={input}
          onChangeText={setInput}
          multiline
          autoCapitalize="sentences"
          autoCorrect={true}
          blurOnSubmit={false}
        />
        <Pressable 
          onPress={handleSend}
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          disabled={!input.trim()}
        >
          <Send size={20} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
});

export const AIChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào bạn! Tôi là Poké-AI. Tôi có thể giúp bạn kiểm tra giá cả, độ hiếm hoặc bất kỳ thông tin nào về Pokémon. Bạn muốn hỏi gì?',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Get market data for AI context
  const { data: markets } = useMarkets();

  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setError(null);

    try {
      // Call OpenRouter AI with market data context
      const aiResponse = await openRouterService.chat(text, markets);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setError(errorMsg);
      const errorAIMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMsg,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorAIMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.aiIcon}>
              <Sparkles size={18} color="#ffffff" fill="#ffffff" />
            </View>
            <View>
              <Text style={styles.headerTitleText}>Poké-AI Assistant</Text>
              <Text style={styles.headerStatus}>Online | Sẵn sàng hỗ trợ</Text>
            </View>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageWrapper, 
                msg.sender === 'user' ? styles.userMsgWrapper : styles.aiMsgWrapper
              ]}
            >
              {msg.sender === 'ai' && (
                <View style={[styles.avatar, styles.aiAvatar]}>
                  <Sparkles size={14} color="#ef4444" />
                </View>
              )}
              <View style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userText : styles.aiText
                ]}>
                  {msg.text}
                </Text>
              </View>
              {msg.sender === 'user' && (
                <View style={[styles.avatar, styles.userAvatar]}>
                  <User size={14} color="#3b82f6" />
                </View>
              )}
            </View>
          ))}
          {isTyping && (
            <View style={styles.aiMsgWrapper}>
              <View style={[styles.avatar, styles.aiAvatar]}>
                <Sparkles size={14} color="#ef4444" />
              </View>
              <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#ef4444" />
              </View>
            </View>
          )}
        </ScrollView>

        <ChatInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerStatus: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '700',
  },
  chatContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
    gap: 8,
  },
  userMsgWrapper: {
    justifyContent: 'flex-end',
  },
  aiMsgWrapper: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  aiAvatar: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  userAvatar: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  typingBubble: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#1e293b',
  },
  inputArea: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '600',
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
});
