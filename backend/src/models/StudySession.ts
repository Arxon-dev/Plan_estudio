import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import StudyPlan from './StudyPlan';
import Theme from './Theme';

export enum SessionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

export enum SessionType {
  STUDY = 'STUDY',
  REVIEW = 'REVIEW',
  TEST = 'TEST',
  SIMULATION = 'SIMULATION',
}

interface StudySessionAttributes {
  id: number;
  studyPlanId: number;
  themeId: number;
  subThemeLabel?: string;
  subThemeIndex?: number;
  scheduledDate: Date;
  scheduledHours: number;
  completedHours?: number;
  status: SessionStatus;
  sessionType?: SessionType;
  reviewStage?: number; // 1..n para repasos; 0 o undefined si estudio
  dueDate?: Date; // fecha de “vencimiento” cognitivo para repaso
  difficulty?: number; // 1-5 estrellas
  notes?: string;
  keyPoints?: string; // Puntos clave aprendidos
  createdAt?: Date;
  updatedAt?: Date;
  pomodorosCompleted?: number;
  actualDuration?: number;
  concentrationScore?: number;
  interruptions?: number;
  lastHeartbeat?: Date;
}

interface StudySessionCreationAttributes extends Optional<StudySessionAttributes, 'id'> { }

class StudySession extends Model<StudySessionAttributes, StudySessionCreationAttributes> implements StudySessionAttributes {
  public id!: number;
  public studyPlanId!: number;
  public themeId!: number;
  public subThemeLabel?: string;
  public subThemeIndex?: number;
  public scheduledDate!: Date;
  public scheduledHours!: number;
  public completedHours?: number;
  public status!: SessionStatus;
  public sessionType?: SessionType;
  public reviewStage?: number;
  public dueDate?: Date;
  public difficulty?: number;
  public notes?: string;
  public keyPoints?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public pomodorosCompleted!: number;
  public actualDuration!: number;
  public concentrationScore!: number;
  public interruptions!: number;
  public lastHeartbeat?: Date;
}

StudySession.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    studyPlanId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'study_plans',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    themeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'themes',
        key: 'id',
      },
    },
    subThemeLabel: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    subThemeIndex: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    scheduledHours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
    },
    completedHours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SessionStatus)),
      allowNull: false,
      defaultValue: SessionStatus.PENDING,
    },
    sessionType: {
      type: DataTypes.ENUM(...Object.values(SessionType)),
      allowNull: true,
    },
    reviewStage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    keyPoints: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pomodorosCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    actualDuration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    concentrationScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
    },
    interruptions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    lastHeartbeat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'study_sessions',
    timestamps: true,
    indexes: [
      {
        fields: ['studyPlanId', 'scheduledDate'],
      },
    ],
  }
);

// Relaciones
StudySession.belongsTo(StudyPlan, { foreignKey: 'studyPlanId', as: 'studyPlan' });
StudySession.belongsTo(Theme, { foreignKey: 'themeId', as: 'theme' });
StudyPlan.hasMany(StudySession, { foreignKey: 'studyPlanId', as: 'sessions' });
Theme.hasMany(StudySession, { foreignKey: 'themeId', as: 'sessions' });

export default StudySession;
