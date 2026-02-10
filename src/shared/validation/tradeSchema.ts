// Trade Form Validation Schemas
import { z } from 'zod';

export const tradeFormSchema = z.object({
  price: z
    .number({
      required_error: 'Giá là bắt buộc',
      invalid_type_error: 'Giá phải là số',
    })
    .positive('Giá phải lớn hơn 0'),
  quantity: z
    .number({
      required_error: 'Số lượng là bắt buộc',
      invalid_type_error: 'Số lượng phải là số',
    })
    .int('Số lượng phải là số nguyên')
    .positive('Số lượng phải lớn hơn 0'),
});

export type TradeFormData = z.infer<typeof tradeFormSchema>;
