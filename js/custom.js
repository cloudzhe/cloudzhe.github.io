/* =========================================
 * CloudCity 博客自定义交互脚本
 * ========================================= */

(function () {
    'use strict';

    /**
     * 初始化点击标题弹出菜单
     * 给导航栏 #site-name .title 绑定点击事件
     * 弹出包含"主页"和"文章"选项的 mini 菜单
     */
    function initTitleMenu() {
        var titleEl = document.querySelector('#site-name .title');
        if (!titleEl) return;

        var siteName = document.getElementById('site-name');
        if (!siteName) return;

        /* 创建菜单容器 */
        var menu = document.createElement('div');
        menu.className = 'title-menu';
        menu.innerHTML =
            '<a class="title-menu-item" href="https://wangyuzhe.top/home-page/">' +
            '<i class="fas fa-home"></i>主页</a>' +
            '<a class="title-menu-item" href="/">' +
            '<i class="fas fa-book-open"></i>文章</a>';

        siteName.appendChild(menu);

        /* 点击标题切换菜单显示 */
        titleEl.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        /* 点击页面其他区域关闭菜单 */
        document.addEventListener('click', function (e) {
            if (!menu.contains(e.target) && e.target !== titleEl) {
                menu.classList.remove('show');
            }
        });

        /* 按 ESC 键关闭菜单 */
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                menu.classList.remove('show');
            }
        });
    }

    /**
     * 初始化封面副标题打字机定格效果
     * 监听 #cover-subtitle 的 class 变化
     * 打字完成后确保光标隐藏
     */
    function initTypingFreeze() {
        var subtitle = document.getElementById('cover-subtitle');
        if (!subtitle) return;

        /* 使用 MutationObserver 监听 class 属性变化 */
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'class') {
                    if (subtitle.classList.contains('typed')) {
                        /* 打字完成，强制隐藏光标 */
                        subtitle.style.setProperty('--cursor-display', 'none');
                    }
                }
            });
        });
        observer.observe(subtitle, { attributes: true });
    }

    /**
     * 替换默认头像为 CloudCity.svg
     * 查找页面中使用默认头像的 img 元素并替换 src
     */
    function replaceDefaultAvatar() {
        var defaultPatterns = ['default.avif', 'default.png', 'cravatar.cn/avatar'];
        var imgs = document.querySelectorAll('img');
        imgs.forEach(function (img) {
            var src = img.getAttribute('src') || '';
            var needReplace = defaultPatterns.some(function (pattern) {
                return src.indexOf(pattern) !== -1;
            });
            if (needReplace) {
                img.setAttribute('src', '/img/CloudCity.svg');
            }
        });
    }

    /**
     * DOM 加载完成后初始化所有功能
     */
    document.addEventListener('DOMContentLoaded', function () {
        initTitleMenu();
        initTypingFreeze();
        replaceDefaultAvatar();
    });
})();
