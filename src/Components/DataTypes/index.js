import Select from './Select';
import Text from './Text';
import Array from './Array';
import Image from './Image';
import Relation from './Relation';
import Markdown from './Markdown';
import Group from './Group';
import Flex from './Flex';

function stringToComponent(string) {
  switch (string) {
    case 'text':
      return Text;
    case 'select':
      return Select;
    case 'array':
      return Array;
    case 'image':
      return Image;
    case 'relation':
      return Relation;
    case 'markdown':
      return Markdown;
    case 'group':
      return Group;
    case 'flex':
      return Flex;
  }
  return false;
}

export default {
  Select,
  Text,
  Array,
  Image,
  Relation,
  Markdown,
  stringToComponent,
};
