import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';

interface MarketingSectionAttributes {
    id: number;
    page: string; // e.g., 'pricing'
    sectionId: string; // e.g., 'hero', 'features'
    content: any; // JSON content
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface MarketingSectionCreationAttributes extends Optional<MarketingSectionAttributes, 'id'> { }

class MarketingSection extends Model<MarketingSectionAttributes, MarketingSectionCreationAttributes> implements MarketingSectionAttributes {
    public id!: number;
    public page!: string;
    public sectionId!: string;
    public content!: any;
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

MarketingSection.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        page: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        sectionId: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        content: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {},
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'marketing_sections',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['page', 'sectionId'],
            },
        ],
    }
);

export default MarketingSection;
