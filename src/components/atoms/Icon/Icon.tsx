import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  DollarOutlined,
  CalendarOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  BellOutlined,
  HomeOutlined,
  TeamOutlined,
  FundProjectionScreenOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  SyncOutlined,
  LockOutlined,
  UnlockOutlined,
  LogoutOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';
import { Colors, type ColorToken } from '@styles/colors';

const iconMap = {
  user: UserOutlined,
  phone: PhoneOutlined,
  mail: MailOutlined,
  dollar: DollarOutlined,
  calendar: CalendarOutlined,
  search: SearchOutlined,
  plus: PlusOutlined,
  edit: EditOutlined,
  delete: DeleteOutlined,
  eye: EyeOutlined,
  filter: FilterOutlined,
  export: ExportOutlined,
  import: ImportOutlined,
  settings: SettingOutlined,
  bell: BellOutlined,
  home: HomeOutlined,
  team: TeamOutlined,
  pipeline: FundProjectionScreenOutlined,
  check: CheckOutlined,
  close: CloseOutlined,
  more: MoreOutlined,
  sync: SyncOutlined,
  lock: LockOutlined,
  unlock: UnlockOutlined,
  logout: LogoutOutlined,
  caretUp: CaretUpOutlined,
  caretDown: CaretDownOutlined,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  color?: ColorToken | string;
  fontSize?: string;
  spin?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Icon({ name, color, fontSize = '1.4rem', spin, onClick, style }: IconProps) {
  const IconComponent = iconMap[name];
  const resolvedColor = color && color in Colors ? Colors[color as ColorToken] : color;

  return (
    <IconComponent
      style={{ color: resolvedColor, fontSize, cursor: onClick ? 'pointer' : undefined, ...style }}
      spin={spin}
      onClick={onClick}
    />
  );
}
