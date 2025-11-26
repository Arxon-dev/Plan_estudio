import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import bcrypt from 'bcrypt';

interface UserAttributes {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isPremium?: boolean;
  stripeCustomerId?: string | null;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused' | null;
  subscriptionEndDate?: Date | null;
  hasUsedTrial?: boolean;
  cancelAtPeriodEnd?: boolean;
  adminNotes?: string | null;
  isBanned?: boolean;
  banReason?: string | null;
  // Baremo Fields
  sexo?: 'H' | 'M' | null;
  ejercito?: 'TIERRA' | 'ARMADA' | 'AIRE_Y_ESPACIO' | null;
  empleo?: 'CABO_PRIMERO' | 'CABO' | null;
  agrupacionEspecialidad?: 'OPERATIVAS' | 'TECNICAS' | null;
  especialidadFundamental?: string | null;
  fechaIngreso?: Date | null;
  fechaAntiguedad?: Date | null;
  tiempoServiciosUnidadesPreferentes?: number;
  tiempoServiciosOtrasUnidades?: number;
  tiempoOperacionesExtranjero?: number;
  notaMediaInformes?: number | null;
  flexionesTronco?: number | null;
  flexionesBrazos?: number | null;
  tiempoCarrera?: number | null;
  circuitoAgilidad?: number | null;
  reconocimientoMedico?: 'APTO' | 'NO_APTO' | null;
  pruebaAcertadas?: number | null;
  pruebaErroneas?: number | null;
  pruebaEnBlanco?: number | null;
  puntosMeritosProfesionales?: number;
  puntosMeritosAcademicos?: number;
  puntosInformesCalificacion?: number;
  puntosPruebasFisicas?: number;
  puntosConcurso?: number;
  puntosOposicion?: number;
  puntosTotal?: number;
  posicionRanking?: number | null;

  perfilPublico?: boolean;
  pomodoroSettings?: any;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public isAdmin!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public isPremium!: boolean;
  public stripeCustomerId!: string | null;
  public subscriptionStatus!: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused' | null;
  public subscriptionEndDate!: Date | null;
  public hasUsedTrial!: boolean;
  public cancelAtPeriodEnd!: boolean;
  public adminNotes!: string | null;
  public isBanned!: boolean;
  public banReason!: string | null;

  // Baremo Fields
  public sexo!: 'H' | 'M' | null;
  public ejercito!: 'TIERRA' | 'ARMADA' | 'AIRE_Y_ESPACIO' | null;
  public empleo!: 'CABO_PRIMERO' | 'CABO' | null;
  public agrupacionEspecialidad!: 'OPERATIVAS' | 'TECNICAS' | null;
  public especialidadFundamental!: string | null;
  public fechaIngreso!: Date | null;
  public fechaAntiguedad!: Date | null;
  public tiempoServiciosUnidadesPreferentes!: number;
  public tiempoServiciosOtrasUnidades!: number;
  public tiempoOperacionesExtranjero!: number;
  public notaMediaInformes!: number | null;
  public flexionesTronco!: number | null;
  public flexionesBrazos!: number | null;
  public tiempoCarrera!: number | null;
  public circuitoAgilidad!: number | null;
  public reconocimientoMedico!: 'APTO' | 'NO_APTO' | null;
  public pruebaAcertadas!: number | null;
  public pruebaErroneas!: number | null;
  public pruebaEnBlanco!: number | null;
  public puntosMeritosProfesionales!: number;
  public puntosMeritosAcademicos!: number;
  public puntosInformesCalificacion!: number;
  public puntosPruebasFisicas!: number;
  public puntosConcurso!: number;
  public puntosOposicion!: number;
  public puntosTotal!: number;
  public posicionRanking!: number | null;
  public perfilPublico!: boolean;
  public pomodoroSettings!: any;

  // Método para validar contraseña
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Método para hashear contraseña
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    stripeCustomerId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    subscriptionStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    hasUsedTrial: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    cancelAtPeriodEnd: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isBanned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    banReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Baremo Fields
    sexo: {
      type: DataTypes.ENUM('H', 'M'),
      allowNull: true,
    },
    ejercito: {
      type: DataTypes.ENUM('TIERRA', 'ARMADA', 'AIRE_Y_ESPACIO'),
      allowNull: true,
    },
    empleo: {
      type: DataTypes.ENUM('CABO_PRIMERO', 'CABO'),
      allowNull: true,
    },
    agrupacionEspecialidad: {
      type: DataTypes.ENUM('OPERATIVAS', 'TECNICAS'),
      allowNull: true,
    },
    especialidadFundamental: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    fechaIngreso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fechaAntiguedad: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tiempoServiciosUnidadesPreferentes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tiempoServiciosOtrasUnidades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tiempoOperacionesExtranjero: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    notaMediaInformes: {
      type: DataTypes.DECIMAL(5, 3),
      allowNull: true,
    },
    flexionesTronco: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    flexionesBrazos: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tiempoCarrera: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    circuitoAgilidad: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
    },
    reconocimientoMedico: {
      type: DataTypes.ENUM('APTO', 'NO_APTO'),
      allowNull: true,
    },
    pruebaAcertadas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pruebaErroneas: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pruebaEnBlanco: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    puntosMeritosProfesionales: {
      type: DataTypes.DECIMAL(5, 3),
      defaultValue: 0,
    },
    puntosMeritosAcademicos: {
      type: DataTypes.DECIMAL(5, 3),
      defaultValue: 0,
    },
    puntosInformesCalificacion: {
      type: DataTypes.DECIMAL(5, 3),
      defaultValue: 0,
    },
    puntosPruebasFisicas: {
      type: DataTypes.DECIMAL(5, 3),
      defaultValue: 0,
    },
    puntosConcurso: {
      type: DataTypes.DECIMAL(6, 3),
      defaultValue: 0,
    },
    puntosOposicion: {
      type: DataTypes.DECIMAL(6, 3),
      defaultValue: 0,
    },
    puntosTotal: {
      type: DataTypes.DECIMAL(6, 3),
      defaultValue: 0,
    },
    posicionRanking: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    perfilPublico: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    pomodoroSettings: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await User.hashPassword(user.password);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await User.hashPassword(user.password);
        }
      },
    },
  }
);

export default User;
