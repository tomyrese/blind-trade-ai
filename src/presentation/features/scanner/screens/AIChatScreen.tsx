import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, MessageSquare, Sparkles, User, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'react-native-linear-gradient';
import { openRouterService } from '../../../../shared/services/OpenRouterService';
import { useMarkets } from '../../../../shared/hooks/useMarkets';
import { useUserStore } from '../../../../shared/stores/userStore';
import { useTranslation } from '../../../../shared/utils/translations';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatInput = React.memo(({ onSend }: { onSend: (text: string) => void }) => {
  const { t } = useTranslation();
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
          placeholder={t('ai_chat_placeholder')}
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
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('ai_chat_greeting'),
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
      const aiResponse = await openRouterService.chat(text, markets, language);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('ai_chat_error');
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
        <LinearGradient 
            colors={['#1e293b', '#0f172a']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={styles.header}
        >
          <View style={styles.headerTitleRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ChevronLeft size={28} color="#ffffff" />
            </Pressable>
            <View style={styles.aiIcon}>
              <Sparkles size={20} color="#0f172a" fill="#0f172a" />
            </View>
            <View>
              <Text style={styles.headerTitleText}>Poké-AI Assistant</Text>
              <Text style={styles.headerStatus}>{t('ai_chat_status')}</Text>
            </View>
          </View>
        </LinearGradient>

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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
    marginRight: 4,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#38bdf8', // bright blue for modern look
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitleText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerStatus: {
    fontSize: 12,
    color: '#34d399',
    fontWeight: '700',
    marginTop: 2,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f8fafc',
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
    gap: 10,
  },
  userMsgWrapper: {
    justifyContent: 'flex-end',
  },
  aiMsgWrapper: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiAvatar: {
    backgroundColor: '#ffffff',
  },
  userAvatar: {
    backgroundColor: '#2563eb',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#2563eb', // Deeper modern blue
    borderBottomRightRadius: 6,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 6,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  typingBubble: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#334155',
  },
  inputArea: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: '#f8fafc',
    borderTopWidth: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendBtnDisabled: {
    backgroundColor: '#e2e8f0',
    shadowOpacity: 0,
    elevation: 0,
  },
});
