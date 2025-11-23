import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import Theme from './Theme';

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum QuestionSource {
  MANUAL = 'MANUAL',
  AI_GENERATED = 'AI_GENERATED',
}

interface TestQuestionAttributes {
  id: number;
  themeId: number;
  themePart?: number;  // Número de parte del tema (1, 2, 3, 4) o null si tema sin partes
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: QuestionDifficulty;
  source: QuestionSource;
  aiModel?: string;
  usageCount: number;
  successRate: number;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface TestQuestionCreationAttributes extends Optional<TestQuestionAttributes, 'id' | 'usageCount' | 'successRate'> { }

class TestQuestion extends Model<TestQuestionAttributes, TestQuestionCreationAttributes> implements TestQuestionAttributes {
  public id!: number;
  public themeId!: number;
  public themePart?: number;
  public question!: string;
  public options!: string[];
  public correctAnswer!: number;
  public explanation!: string;
  public difficulty!: QuestionDifficulty;
  public source!: QuestionSource;
  public aiModel?: string;
  public usageCount!: number;
  public successRate!: number;
  public tags!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TestQuestion.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
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
    themePart: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
      comment: 'Número de parte del tema (1, 2, 3, 4...) o NULL si tema sin partes',
    },
    question: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        len: {
          args: [20, 500],
          msg: 'La pregunta debe tener entre 20 y 500 caracteres',
        },
      },
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidOptions(value: string[]) {
          if (!Array.isArray(value) || value.length < 2 || value.length > 4) {
            throw new Error('Debe haber entre 2 y 4 opciones de respuesta');
          }
          if (new Set(value).size !== value.length) {
            throw new Error('Las opciones deben ser diferentes entre sí');
          }
        },
      },
    },
    correctAnswer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 3,
      },
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: {
          args: [50, 2000],
          msg: 'La explicación debe tener entre 50 y 2000 caracteres',
        },
      },
    },
    difficulty: {
      type: DataTypes.ENUM(...Object.values(QuestionDifficulty)),
      allowNull: false,
    },
    source: {
      type: DataTypes.ENUM(...Object.values(QuestionSource)),
      allowNull: false,
      defaultValue: QuestionSource.MANUAL,
    },
    aiModel: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    usageCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    successRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'test_questions',
    timestamps: true,
    indexes: [
      {
        fields: ['themeId', 'difficulty'],
      },
      {
        fields: ['themeId', 'themePart'],  // Índice para filtrar por tema y parte
      },
      {
        fields: ['source'],
      },
      {
        fields: ['successRate'],
      },
      {
        fields: ['tags'],
        // type: 'GIN' solo disponible en PostgreSQL
      },
    ],
  }
);

// Relaciones
TestQuestion.belongsTo(Theme, { foreignKey: 'themeId', as: 'theme' });
Theme.hasMany(TestQuestion, { foreignKey: 'themeId', as: 'questions' });

export default TestQuestion;
