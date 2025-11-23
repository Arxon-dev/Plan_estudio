import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';

interface SystemSettingAttributes {
    key: string;
    value: string; // Almacenamos como string, convertimos según 'type'
    type: 'string' | 'number' | 'boolean' | 'json';
    category: 'general' | 'limits' | 'ai' | 'roles' | 'payment';
    description: string;
    isPublic: boolean; // Si es true, se puede enviar al frontend sin auth admin (ej: precios)
}

interface SystemSettingCreationAttributes extends Optional<SystemSettingAttributes, 'description' | 'isPublic'> { }

class SystemSetting extends Model<SystemSettingAttributes, SystemSettingCreationAttributes> implements SystemSettingAttributes {
    public key!: string;
    public value!: string;
    public type!: 'string' | 'number' | 'boolean' | 'json';
    public category!: 'general' | 'limits' | 'ai' | 'roles' | 'payment';
    public description!: string;
    public isPublic!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Helper para obtener el valor con el tipo correcto
    public getTypedValue(): any {
        switch (this.type) {
            case 'number':
                return Number(this.value);
            case 'boolean':
                return this.value === 'true';
            case 'json':
                try {
                    return JSON.parse(this.value);
                } catch (e) {
                    return null;
                }
            default:
                return this.value;
        }
    }
}

SystemSetting.init(
    {
        key: {
            type: DataTypes.STRING(100),
            primaryKey: true,
            allowNull: false,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
            allowNull: false,
            defaultValue: 'string',
        },
        category: {
            type: DataTypes.ENUM('general', 'limits', 'ai', 'roles', 'payment'),
            allowNull: false,
            defaultValue: 'general',
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'system_settings',
        timestamps: true,
    }
);

export default SystemSetting;
