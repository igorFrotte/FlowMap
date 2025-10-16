import { z } from 'zod';

export const authSchema = z.object({
    email: z.email("Formato de email inválido."),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres.")
        .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
        .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
        .regex(/\d/, "A senha deve conter pelo menos um número.")
        .regex(/[@$!%*?&]/, "A senha deve conter pelo menos um símbolo especial."),
});

export const signUpSchema = z.object({
    email: z.email("Formato de email inválido."),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres.")
        .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
        .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
        .regex(/\d/, "A senha deve conter pelo menos um número.")
        .regex(/[@$!%*?&]/, "A senha deve conter pelo menos um símbolo especial."),
    nome: z.string("O nome é obrigatório")
        .min(2, "O nome deve ter pelo menos 2 caracteres")
        .max(100, "O nome pode ter no máximo 100 caracteres")
        .regex(/^[A-Za-zÀ-ÿ\s]+$/, "O nome deve conter apenas letras e espaços")
        .trim(),
    idCurso: z.number().int().positive(),
});

