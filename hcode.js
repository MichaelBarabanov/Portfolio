(function () {
  var el = document.getElementById('hcode-output');
  if (!el) return;

  var code = [
    '<?php declare(strict_types=1);',
    '',
    'namespace Mbara\\Plugin\\Subscriber;',
    '',
    'use Shopware\\Core\\Content\\Product\\ProductEvents;',
    'use Shopware\\Core\\Framework\\DataAbstractionLayer',
    '    \\Event\\EntityWrittenEvent;',
    'use Symfony\\Component\\EventDispatcher',
    '    \\EventSubscriberInterface;',
    '',
    'class AiProductSubscriber implements EventSubscriberInterface',
    '{',
    '    public function __construct(',
    '        private readonly AiDescriptionService $aiService',
    '    ) {}',
    '',
    '    public static function getSubscribedEvents(): array',
    '    {',
    '        return [',
    '            ProductEvents::PRODUCT_WRITTEN_EVENT',
    "                => 'onProductWritten',",
    '        ];',
    '    }',
    '',
    '    public function onProductWritten(',
    '        EntityWrittenEvent $event',
    '    ): void {',
    '        foreach ($event->getWriteResults() as $result) {',
    '            $this->aiService->generateDescription(',
    '                $result->getPrimaryKey()',
    '            );',
    '        }',
    '    }',
    '}'
  ].join('\n');

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(txt) {
    var s = esc(txt);
    s = s.replace(/(\/\/[^\n]*)/g, '<span class="hc-cm">$1</span>');
    s = s.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="hc-str">$1</span>');
    s = s.replace(/(&lt;\?php)/g, '<span class="hc-tag">$1</span>');
    s = s.replace(/\b(declare|namespace|use|class|implements|public|protected|private|static|readonly|function|return|array|string|int|void|bool|foreach|new|self|null|true|false|as)\b/g,
      '<span class="hc-kw">$1</span>');
    s = s.replace(/(\$[a-zA-Z_]\w*)/g, '<span class="hc-var">$1</span>');
    s = s.replace(/\b([A-Z][a-zA-Z0-9]+)\b/g, '<span class="hc-cls">$1</span>');
    s = s.replace(/\b(\d+)\b/g, '<span class="hc-nm">$1</span>');
    return s;
  }

  var pos = 0;

  function tick() {
    if (pos > code.length) {
      setTimeout(function () {
        pos = 0;
        el.innerHTML = '';
        tick();
      }, 5000);
      return;
    }
    el.innerHTML = highlight(code.slice(0, pos)) + '<span class="hc-cursor"> </span>';
    pos++;
    var ch = code[pos - 1];
    var delay = ch === '\n' ? 55 : Math.random() * 22 + 8;
    setTimeout(tick, delay);
  }

  setTimeout(tick, 900);
})();
