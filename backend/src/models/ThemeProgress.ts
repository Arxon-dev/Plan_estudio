import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';
import Theme from './Theme';

export enum ThemeLevel {
  LOCKED = 'LOCKED',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND',
}

interface ThemeProgressAttributes {
  id: number;
  userId: number;
  themeId: number;
  level: ThemeLevel;
  totalTests: number;
  averageScore: number;
  bestScore: number;
  worstScore?: number;
  studySessionsCompleted: number;
  reviewSessionsCompleted: number;
  testSessionsCompleted: number;
  masteryLevel: number;
  weakTopics?: any;
  strongTopics?: any;
  learningCurve?: any;
  estimatedTimeToMastery?: number;
  lastTestDate?: Date;
  lastStudyDate?: Date;
  nextReviewDate?: Date;
  updatedAt?: Date;
}

interface ThemeProgressCreationAttributes extends Optional<ThemeProgressAttributes, 'id' | 'level' | 'totalTests' | 'averageScore' | 'bestScore' | 'studySessionsCompleted' | 'reviewSessionsCompleted' | 'testSessionsCompleted' | 'masteryLevel'> {}

class ThemeProgress extends Model<ThemeProgressAttributes, ThemeProgressCreationAttributes> implements ThemeProgressAttributes {
  public id!: number;
  public userId!: number;
  public themeId!: number;
  public level!: ThemeLevel;
  public totalTests!: number;
  public averageScore!: number;
  public bestScore!: number;
  public worstScore?: number;
  public studySessionsCompleted!: number;
  public reviewSessionsCompleted!: number;
  public testSessionsCompleted!: number;
  public masteryLevel!: number;
  public weakTopics?: any;
  public strongTopics?: any;
  public learningCurve?: any;
  public estimatedTimeToMastery?: number;
  public lastTestDate?: Date;
  public lastStudyDate?: Date;
  public nextReviewDate?: Date;
  public readonly updatedAt!: Date;
}

ThemeProgress.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
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
      onDelete: 'CASCADE',
    },
    level: {
      type: DataTypes.ENUM(...Object.values(ThemeLevel)),
      allowNull: false,
      defaultValue: ThemeLevel.LOCKED,
    },
    totalTests: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    averageScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    bestScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    worstScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    studySessionsCompleted: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    reviewSessionsCompleted: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    testSessionsCompleted: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    masteryLevel: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    weakTopics: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    strongTopics: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    learningCurve: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    estimatedTimeToMastery: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Horas estimadas para llegar a 95%',
    },
    lastTestDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastStudyDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextReviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'theme_progress',
    timestamps: true,
    createdAt: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'themeId'],
      },
      {
        fields: ['level', 'averageScore'],
      },
    ],
  }
);

// Relaciones
ThemeProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ThemeProgress.belongsTo(Theme, { foreignKey: 'themeId', as: 'theme' });

User.hasMany(ThemeProgress, { foreignKey: 'userId', as: 'themeProgress' });
Theme.hasMany(ThemeProgress, { foreignKey: 'themeId', as: 'userProgress' });

export default ThemeProgress;
