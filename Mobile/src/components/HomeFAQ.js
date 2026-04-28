import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeFAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is HeartEcho AI?",
      answer: "HeartEcho is an advanced AI chatbot platform that lets you chat with AI-powered assistants, create custom AI characters, and personalize chatbot responses.",
    },
    {
      question: "How does HeartEcho AI chatbot work?",
      answer: "Our AI chatbots use natural language processing (NLP) and machine learning to understand user queries, provide human-like responses, and learn from conversations.",
    },
    {
      question: "Can I create my own AI chatbot?",
      answer: "Yes! With HeartEcho, you can customize and train your AI chatbot with unique personalities, knowledge, and response styles.",
    },
    {
      question: "Is HeartEcho free to use?",
      answer: "HeartEcho offers a free AI chatbot experience, but premium features are available with HeartEcho Pro.",
    },
    {
      question: "How do I get started with HeartEcho?",
      answer: "1. Sign up for free\n2. Choose or create an AI chatbot\n3. Start chatting instantly!",
    },
  ];

  const toggleFAQ = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      <Text style={styles.subtitle}>Find quick answers to common questions about HeartEcho AI</Text>

      <View style={styles.list}>
        {faqs.map((faq, index) => {
          const isActive = activeIndex === index;
          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.faqItem, isActive && styles.faqActive]}
              onPress={() => toggleFAQ(index)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.question}>{faq.question}</Text>
                <Ionicons 
                  name={isActive ? 'remove' : 'add'} 
                  size={20} 
                  color={isActive ? '#cf4185' : '#fff'} 
                />
              </View>
              {isActive && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answer}>{faq.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 6,
  },
  list: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  faqActive: {
    borderColor: 'rgba(207,65,133,0.3)',
    backgroundColor: 'rgba(207,65,133,0.08)',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  answerContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  answer: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 22,
  }
});
