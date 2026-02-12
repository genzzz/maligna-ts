import { Formatter } from './Formatter';
import { Alignment } from '../coretypes/Alignment';
import { formatAl } from '../util/bind/al-xml';

/**
 * Formats alignments as .al XML.
 */
export class AlFormatter implements Formatter {
  format(alignmentList: Alignment[]): string {
    return formatAl(alignmentList);
  }
}
