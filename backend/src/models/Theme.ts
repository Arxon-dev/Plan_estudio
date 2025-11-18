import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';

export enum ThemeBlock {
  ORGANIZACION = 'ORGANIZACION',
  JURIDICO_SOCIAL = 'JURIDICO_SOCIAL',
  SEGURIDAD_NACIONAL = 'SEGURIDAD_NACIONAL',
}

export enum ThemeComplexity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

interface ThemeAttributes {
  id: number;
  block: ThemeBlock;
  themeNumber: number;
  title: string;
  content: string;
  parts?: number;
  estimatedHours: number;
  complexity: ThemeComplexity;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ThemeCreationAttributes extends Optional<ThemeAttributes, 'id'> {}

class Theme extends Model<ThemeAttributes, ThemeCreationAttributes> implements ThemeAttributes {
  public id!: number;
  public block!: ThemeBlock;
  public themeNumber!: number;
  public title!: string;
  public content!: string;
  public parts?: number;
  public estimatedHours!: number;
  public complexity!: ThemeComplexity;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Theme.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    block: {
      type: DataTypes.ENUM(...Object.values(ThemeBlock)),
      allowNull: false,
    },
    themeNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    parts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 2.0,
    },
    complexity: {
      type: DataTypes.ENUM(...Object.values(ThemeComplexity)),
      allowNull: false,
      defaultValue: ThemeComplexity.MEDIUM,
    },
  },
  {
    sequelize,
    tableName: 'themes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['block', 'themeNumber'],
      },
    ],
  }
);

export default Theme;
