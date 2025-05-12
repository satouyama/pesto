import * as Yup from 'yup';

const SignUpSchema = Yup.object().shape({
  firstName: Yup.string().required('O nome é obrigatório'),
  lastName: Yup.string().required('O sobrenome é obrigatório'),
  email: Yup.string()
    .email('E-mail inválido')
    .required('O e-mail é obrigatório'),
  phoneNumber: Yup.string().required('O número de telefone é obrigatório'),
  address: Yup.string().required('O endereço é obrigatório'),
  password: Yup.string()
    .min(8, 'A senha deve ter ao menos 8 caracteres')
    .required('A senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'As senhas devem ser iguais')
    .required('A confirmação de senha é obrigatória'),
});

export default SignUpSchema;
