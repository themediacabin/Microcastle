import Select from './Select';
import Text from './Text';
import Array from './Array';
import Image from './Image';

function stringToComponent(string) {
  switch(string) {
    case 'text':
      return Text;
    case 'select':
      return Select;
    case 'array':
      return Array;
    case 'image':
      return Image;
  };
  return false;
}

export default {
  Select,
  Text,
  Array,
  Image,
  stringToComponent,
}
