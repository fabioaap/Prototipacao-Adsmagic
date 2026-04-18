#!/usr/bin/env python3

import argparse
import json
from urllib.parse import parse_qs, urlparse


def normalize_node_id(value):
    if not value:
        return None
    return value.replace('-', ':')


def extract_from_figma_url(figma_url):
    if not figma_url:
        return None, None

    parsed = urlparse(figma_url)
    segments = [segment for segment in parsed.path.split('/') if segment]
    file_key = None

    if len(segments) >= 2 and segments[0] in ('design', 'board', 'make'):
        file_key = segments[1]

    query = parse_qs(parsed.query)
    raw_node_id = query.get('node-id', [None])[0]
    return file_key, normalize_node_id(raw_node_id)


def command_normalize(args):
    file_key_from_url, node_id_from_url = extract_from_figma_url(args.figma_url)
    file_key = args.file_key or file_key_from_url
    node_id = normalize_node_id(args.node_id) or node_id_from_url

    payload = {
        'routeUrl': args.url,
        'frameName': args.frame_name,
        'target': {
            'mode': 'existingFile' if file_key else 'newFile',
            'figmaUrl': args.figma_url,
            'fileKey': file_key,
            'nodeId': node_id,
        },
        'options': {
            'preferOfficialMcp': True,
            'useGuardedCapture': bool(args.guarded),
            'verifyNodeId': normalize_node_id(args.verify_node_id) or node_id,
            'captureDelayMs': args.delay,
            'topBlockOffsetPx': args.top_block_offset,
            'selector': args.selector,
        },
    }

    print(json.dumps(payload, indent=2, ensure_ascii=False))
    return 0


def build_parser():
    parser = argparse.ArgumentParser(description='Normaliza requests de exportacao local para o Figma.')
    subparsers = parser.add_subparsers(dest='command', required=True)

    normalize_parser = subparsers.add_parser('normalize', help='Normaliza um request de exportacao para o Figma.')
    normalize_parser.add_argument('--url', required=True)
    normalize_parser.add_argument('--frame-name', required=True)
    normalize_parser.add_argument('--figma-url')
    normalize_parser.add_argument('--file-key')
    normalize_parser.add_argument('--node-id')
    normalize_parser.add_argument('--verify-node-id')
    normalize_parser.add_argument('--selector', default='div.page-shell.section-stack-md')
    normalize_parser.add_argument('--delay', type=int, default=1800)
    normalize_parser.add_argument('--top-block-offset', type=int, default=0)
    normalize_parser.add_argument('--guarded', action='store_true')
    normalize_parser.set_defaults(func=command_normalize)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == '__main__':
    raise SystemExit(main())
