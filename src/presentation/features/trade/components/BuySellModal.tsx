// Buy/Sell Modal with React Hook Form
import React from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, TrendingUp, TrendingDown } from 'lucide-react-native';
import { tradeFormSchema, TradeFormData } from '../../../../shared/validation/tradeSchema';
import { formatPrice } from '../../../../shared/utils/formatters';

interface BuySellModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'buy' | 'sell';
  symbol: string;
  currentPrice: number;
  onSubmit: (data: TradeFormData) => void;
}

export const BuySellModal: React.FC<BuySellModalProps> = ({
  isVisible,
  onClose,
  type,
  symbol,
  currentPrice,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      price: currentPrice,
      quantity: 1,
    },
  });

  const price = watch('price');
  const quantity = watch('quantity');
  const total = price && quantity ? price * quantity : 0;

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: TradeFormData) => {
    onSubmit(data);
    handleClose();
  };

  const isBuy = type === 'buy';
  const Icon = isBuy ? TrendingUp : TrendingDown;
  const color = isBuy ? '#10b981' : '#ef4444';
  const bgColor = isBuy ? '#d1fae5' : '#fee2e2';

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <ScrollView
          style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '90%',
          }}
          contentContainerStyle={{ padding: 24 }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: bgColor, borderRadius: 8, padding: 8 }}>
                <Icon size={24} color={color} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginLeft: 12 }}>
                {isBuy ? 'Mua' : 'Bán'} {symbol}
              </Text>
            </View>
            <Pressable onPress={handleClose}>
              <X size={24} color="#6b7280" />
            </Pressable>
          </View>

          {/* Current Price */}
          <View
            style={{
              backgroundColor: '#f3f4f6',
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Giá Thị Trường</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 4 }}>
              {formatPrice(currentPrice)}
            </Text>
          </View>

          {/* Price Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Giá
            </Text>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  placeholder="Nhập giá"
                  keyboardType="decimal-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: errors.price ? '#ef4444' : '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: '#ffffff',
                  }}
                />
              )}
            />
            {errors.price && (
              <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                {errors.price.message}
              </Text>
            )}
          </View>

          {/* Quantity Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Số Lượng
            </Text>
            <Controller
              control={control}
              name="quantity"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  placeholder="Nhập số lượng"
                  keyboardType="number-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: errors.quantity ? '#ef4444' : '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: '#ffffff',
                  }}
                />
              )}
            />
            {errors.quantity && (
              <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                {errors.quantity.message}
              </Text>
            )}
          </View>

          {/* Total */}
          <View
            style={{
              backgroundColor: '#f9fafb',
              padding: 16,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Tổng Giá Trị</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: color }}>
                {formatPrice(total)}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit(handleFormSubmit)}
            style={{
              backgroundColor: color,
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
              Xác Nhận {isBuy ? 'Mua' : 'Bán'}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};
